import fs from 'node:fs'
import {compile} from '../../public/engine/native.mjs'
let count=0
for(const file of fs.readdirSync('src/assets/programms').filter(f=>f.endsWith('.json')&&f!=='index.json')){
 const program=JSON.parse(fs.readFileSync('src/assets/programms/'+file))
 if(program.engine?.version!==2||program.engine.compatibility)throw new Error(`${program.id} still requires a compatibility engine`)
 try{compile({definition:program.engine})}catch(error){throw new Error(`${program.id}: ${error.message}`)}
 count++
}
console.log(`Validated ${count} native programs and all rule programs without the reference interpreter.`)
