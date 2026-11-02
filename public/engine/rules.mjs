/** Bounded, data-only rule programs. No eval, dynamic code, or external interpreter. */
const operators=['>=','<=','==','!=','&&','||','+=','-=','*=','/=','+','-','*','/','%','>','<','!','=','?',':','(',')','[',']','{','}',',',';']
export function compileRule(source){
 source=source.replace(/^\s*\{~/,'').replace(/~\}\s*$/,'').replace(/\/\/[^\n]*/g,'')
 const tokens=[];let offset=0
 while(offset<source.length){
  const text=source.slice(offset),space=text.match(/^\s+/);if(space){offset+=space[0].length;continue}
  const n=text.match(/^\d+(?:\.\d+)?(?:kg|lb|%)?/)
  if(n){tokens.push({kind:'number',value:n[0]});offset+=n[0].length;continue}
  const id=text.match(/^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*/)
  if(id){tokens.push({kind:'name',value:id[0]});offset+=id[0].length;continue}
  const op=operators.find(op=>text.startsWith(op));if(!op)throw new Error(`Unknown rule token at ${offset}: ${text.slice(0,30)}`)
  tokens.push({kind:'operator',value:op});offset+=op.length
 }
 let pos=0
 const peek=()=>tokens[pos]?.value
 const take=value=>{if(value!=null&&peek()!==value)throw new Error(`Expected ${value}, got ${peek()} at rule token ${pos}`);return tokens[pos++]}
 const precedence={'||':1,'&&':2,'==':3,'!=':3,'<':4,'>':4,'<=':4,'>=':4,'+':5,'-':5,'*':6,'/':6,'%':6}
 function expression(level=0){
  let node
  if(peek()==='!'||peek()==='-'||peek()==='+'){const op=take().value;node=['unary',op,expression(7)]}
  else if(peek()==='('){take('(');node=expression();take(')')}
  else {const token=take();if(!token)throw new Error('Unexpected end of rule');if(token.kind==='number'){
    const m=token.value.match(/^([\d.]+)(kg|lb|%)?$/);node=['value',m[2]?{value:Number(m[1]),unit:m[2]}:Number(m[1])]
   }else if(token.kind==='name')node=['read',token.value,[]];else throw new Error(`Expected rule expression, got ${token.value}`)
  }
  while(true){
   if(peek()==='['){take('[');const selectors=[];do {if(peek()==='*'){take('*');selectors.push(null)}else selectors.push(expression());if(peek()!==':')break;take(':')}while(true);take(']');node=['read',node[1],selectors];continue}
   if(peek()==='('){take('(');const args=[];while(peek()!==')'){args.push(expression());if(peek()!==',')break;take(',')}take(')');node=['call',node[1],args];continue}
   const p=precedence[peek()];if(p==null||p<=level)break
   const op=take().value;node=['binary',op,node,expression(p)]
  }
  if(level===0&&peek()==='?'){take('?');const yes=expression();take(':');node=['choose',node,yes,expression()]}
  return node
 }
 function block(){if(peek()!=='{')return [statement()];take('{');const out=[];while(peek()!=='}'){if(!peek())throw new Error('Unclosed rule block');out.push(statement())}take('}');return out}
 function statement(){
  if(peek()===';'){take(';');return ['empty']}
  if(peek()==='if'){take('if');take('(');const test=expression();take(')');const yes=block();let no=[];if(peek()==='else'){take('else');no=block()}return ['if',test,yes,no]}
  if(peek()==='for'){take('for');take('(');const name=take().value;take('in');const list=expression();take(')');return ['for',name,list,block()]}
  const target=expression()
  if(['=','+=','-=','*=','/='].includes(peek())){const op=take().value;const value=expression();if(peek()===';')take(';');if(target[0]!=='read')throw new Error('Only rule fields can be assigned');return ['write',target[1],target[2],op,value]}
  if(peek()===';')take(';');return ['do',target]
 }
 const program=[];while(pos<tokens.length)program.push(statement())
 return program
}
export function kilograms(value){
 if(value==null)return 0
 if(typeof value==='number')return value
 if(typeof value==='boolean')return value?1:0
 if(value.unit==='lb')return Math.round(value.value*0.45359237*2)/2
 return Number(value.value)
}
export function executeRule(program,environment){
 let budget=20000;const locals={}
 const spend=()=>{if(--budget<0)throw new Error('Training rule exceeded its operation limit.')}
 const list=value=>Array.isArray(value)?value:[value]
 const numeric=value=>value&&typeof value==='object'&&!Array.isArray(value)&&value.unit==='%'?environment.maximum()*value.value/100:kilograms(value)
 const truth=value=>Array.isArray(value)?value.every(truth):Boolean(numeric(value))
 function binary(op,a,b){
  if(Array.isArray(a)||Array.isArray(b)){
   const length=Math.max(Array.isArray(a)?a.length:0,Array.isArray(b)?b.length:0)
   const values=Array.from({length},(_,i)=>binary(op,Array.isArray(a)?a[i]:a,Array.isArray(b)?b[i]:b))
   return ['==','!=','<','>','<=','>='].includes(op)?values.every(Boolean):values
  }
  const aq=a&&typeof a==='object'&&typeof a.unit==='string',bq=b&&typeof b==='object'&&typeof b.unit==='string'
  if(op==='*'&&aq&&!bq)return {value:a.value*numeric(b),unit:a.unit}
  if(op==='*'&&bq&&!aq)return {value:b.value*numeric(a),unit:b.unit}
  if(op==='/'&&aq&&!bq)return {value:numeric(b)===0?0:a.value/numeric(b),unit:a.unit}
  if((op==='+'||op==='-')&&aq&&bq&&a.unit===b.unit)return {value:op==='+'?a.value+b.value:a.value-b.value,unit:a.unit}
  a=numeric(a);b=numeric(b)
  switch(op){case '+':return a+b;case '-':return a-b;case '*':return a*b;case '/':return b===0?0:a/b;case '%':return a%b;case '==':return a===b?1:0;case '!=':return a!==b?1:0;case '<':return a<b?1:0;case '>':return a>b?1:0;case '<=':return a<=b?1:0;case '>=':return a>=b?1:0;default:throw new Error(`Unsupported rule operator ${op}`)}
 }
 function read(node){
  spend();const [kind,a,b,c]=node
  if(kind==='value')return a
  if(kind==='read')return a.startsWith('var.')?(locals[a]??0):environment.read(a,b.map(x=>x==null?null:numeric(read(x))))
  if(kind==='unary')return a==='!'?!truth(read(b)):a==='-'?-numeric(read(b)):numeric(read(b))
  if(kind==='choose')return truth(read(a))?read(b):read(c)
  if(kind==='binary'){
   if(a==='&&')return truth(read(b))&&truth(read(c))?1:0
   if(a==='||')return truth(read(b))||truth(read(c))?1:0
   return binary(a,read(b),read(c))
  }
  if(kind==='call'){
   const args=b.map(read),flat=args.flat().map(numeric)
   switch(a){case 'sum':return flat.reduce((n,x)=>n+x,0);case 'min':return Math.min(...flat);case 'max':return Math.max(...flat);case 'floor':return Math.floor(flat[0]);case 'round':return Math.round(flat[0]);case 'roundWeight':return environment.round(flat[0]);case 'rpeMultiplier':return environment.effortMultiplier(flat[0],flat[1]);case 'sets':return environment.sets(...flat);default:throw new Error(`Unsupported rule function ${a}`)}
  }
  throw new Error(`Unknown rule expression ${kind}`)
 }
 function run(statements){for(const node of statements){
  spend();const [kind,a,b,c,d]=node
  if(kind==='if')run(truth(read(a))?b:c)
  else if(kind==='for'){const values=list(read(b));for(let i=1;i<=values.length;i++){locals[a]=i;run(c)}}
  else if(kind==='write'){
   const value=read(d),selectors=b.map(x=>x==null?null:numeric(read(x)))
   if(a.startsWith('var.'))locals[a]=c==='='?value:binary(c[0],locals[a]??0,value)
   else environment.write(a,selectors,c,value,binary)
  }else if(kind==='do')read(a)
 }}
 run(program)
}

export function validateRuleProgram(program){
 const fields=new Set(['weights','reps','minReps','RPE','setTime','completedReps','completedWeights','completedRPE','completedSetTime','ns','numberOfSets','programNumberOfSets','completedNumberOfSets','setIndex','week','dayInWeek','day','rm1','setVariationIndex','exerciseVariationIndex','descriptionIndex'])
 const writable=new Set(['weights','reps','minReps','RPE','setTime','numberOfSets','rm1','setVariationIndex','exerciseVariationIndex','descriptionIndex'])
 const functions=new Set(['sum','min','max','floor','round','roundWeight','rpeMultiplier','sets'])
 const custom=name=>/^(state|var)\.[A-Za-z_]\w*$/.test(name)&&!['__proto__','constructor','prototype'].includes(name.split('.')[1])
 let remaining=20000
 function check(node,depth=0){
  if(--remaining<0||depth>100||!Array.isArray(node))throw new Error('Invalid or excessively complex training-rule program.')
  const [kind,a,b,c,d]=node
  const child=n=>check(n,depth+1),block=nodes=>{if(!Array.isArray(nodes))throw new Error('Invalid rule block');nodes.forEach(child)}
  if(kind==='value'){if(typeof a==='number'&&Number.isFinite(a))return;if(a&&typeof a==='object'&&['kg','lb','%'].includes(a.unit)&&Number.isFinite(a.value))return;throw new Error('Invalid rule constant')}
  if(kind==='read'||kind==='write'){
   if(typeof a!=='string'||!(fields.has(a)||custom(a))||kind==='write'&&!(writable.has(a)||custom(a)))throw new Error(`Unsupported rule field: ${a}`)
   if(!Array.isArray(b)||![0,1,4].includes(b.length))throw new Error('Invalid rule selector')
   b.filter(x=>x!=null).forEach(child)
   if(kind==='write'){if(!['=','+=','-=','*=','/='].includes(c))throw new Error('Invalid rule assignment');child(d)}
  }else if(kind==='binary'){if(!['+','-','*','/','%','==','!=','<','>','<=','>=','&&','||'].includes(a))throw new Error('Invalid rule operator');child(b);child(c)}
  else if(kind==='unary'){if(!['!','+','-'].includes(a))throw new Error('Invalid unary rule operator');child(b)}
  else if(kind==='choose'){child(a);child(b);child(c)}
  else if(kind==='call'){if(!functions.has(a)||!Array.isArray(b))throw new Error(`Unsupported rule function: ${a}`);b.forEach(child)}
  else if(kind==='if'){child(a);block(b);block(c)}
  else if(kind==='for'){if(!a.startsWith('var.')||!custom(a))throw new Error('Invalid rule loop variable');child(b);block(c)}
  else if(kind==='do')child(a)
  else if(kind!=='empty')throw new Error(`Unsupported training-rule operation: ${kind}`)
 }
 if(!Array.isArray(program))throw new Error('Rule programs must be arrays of operations.')
 program.forEach(node=>check(node))
 return program
}
