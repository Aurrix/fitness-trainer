import {selectedVersion} from './versions.mjs'
import {prioritizeProgramExercises} from './program-coverage.mjs'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {execFileSync, execFile} from 'node:child_process'
import {promisify} from 'node:util'
const exec=promisify(execFile)
const root='.exercise-media-references/remaining'
const versionFor=id=>selectedVersion(root+'/'+id)
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'')
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'))
const write=(p,value)=>{fs.mkdirSync(path.dirname(p),{recursive:true});const temporary=p+'.'+process.pid+'.tmp';fs.writeFileSync(temporary,JSON.stringify(value,null,2)+'\n');fs.renameSync(temporary,p)}
const hash=b=>crypto.createHash('sha256').update(b).digest('hex')
const aliases={
 'barbell-bent-over-row':['Bent_Over_Barbell_Row','Conventional bent-over barbell row, pronated grip.'],
 'barbell-concentration-curl':['Seated_Close-Grip_Concentration_Barbell_Curl','Representative seated close-grip barbell concentration curl; broad catalog entry has no setup instructions.'],
 'barbell-good-morning':['Good_Morning','Barbell across upper back, controlled hip hinge.'],
 'barbell-incline-press':['Barbell_Incline_Bench_Press_-_Medium_Grip','Conventional incline barbell bench press.'],
 'barbell-single-leg-squat':['One_Leg_Barbell_Squat','Barbell single-leg squat; verify actual stance from source.'],
 'barbell-stiff-leg-deadlift':['Stiff-Legged_Barbell_Deadlift','Stiff-legged barbell deadlift; do not substitute a conventional bent-knee deadlift.'],
 'liftosaur-behindtheneckpress-barbell':['Standing_Barbell_Press_Behind_Neck','Standing strict barbell press from behind neck, not a push press.'],
 'liftosaur-benchpress-dumbbell':['Dumbbell_Bench_Press','Flat dumbbell bench press.'],
 'liftosaur-benchpressclosegrip-barbell':['Close-Grip_Barbell_Bench_Press','Flat close-grip barbell bench press.'],
 'liftosaur-benchpresswidegrip-barbell':['Wide-Grip_Barbell_Bench_Press','Flat wide-grip barbell bench press.'],
 'liftosaur-bentoveronearmrow-dumbbell':['One-Arm_Dumbbell_Row','One-arm dumbbell row supported on bench.']
}
const style=`Use case: scientific-educational. Asset: one SQUARE contact sheet of SIXTEEN square animation cells, EXACT 4 columns × 4 rows, no gutters, numbers, arrows or text. White/warm ivory studio floor, soft shadows. Neutral ADULT gray mannequin fully clothed in opaque fitted workout top, shorts over leggings, shoes. Schematic muscle-color overlays ON THE CLOTHING: primary targets orange, secondary amber; primary wins overlap. No exposed anatomy or transparent clothing, no logos or likeness of reference person. Use reference photographs only for exact exercise setup, equipment geometry and endpoint poses. Choose one fixed three-quarter camera exposing primary target region; SAME camera, body orientation, framing, size, equipment and color placement in all 16 cells. Never mirror the body to switch sides.
Read left-to-right top-to-bottom: frames1–8 gradually move from setup to endpoint; frames9–16 gradually return nearly to initial pose, one controlled complete cycle. Alternate limbs within the SAME camera for alternating exercises. Stretches/isometrics use a gentle setup and SUSTAINED stable hold, not pulses. Ballistic/traveling actions use one forward action and recovery; never reverse a projectile. Keep contacts, rigid lengths, pivots and planted feet fixed. No floating weights, extra limbs, equipment warping, torso teleporting, camera zoom, cropping outside cells or extra partial reps. Place all 16 cells at identical local floor height.
Anatomy colors are approximate broad surface regions, not measured activation. Biceps=front upper arm; triceps=back upper arm; quads=front thighs NOT buttocks; hamstrings=rear thighs; glutes=buttocks; deltoids=shoulder caps; abs=abdomen; lats=outer back; spinal erectors=two LOWER back strips, NOT whole spine; upper back=between shoulder blades; adductors=inner thighs; calves=REAR lower leg. Do not color equipment. Do not invent visible deep-muscle heads. This is a private exercise-animation draft.`
function plan(){
 if(fs.existsSync(root+'/inventory.json')){console.log('Existing frozen inventory preserved');return}
 const upstream=read('scripts/exercise-import/upstream.json')
 const byName=new Map(upstream.map(e=>[norm(e.name),e]))
 const selected=read('src/assets/exercises/index.json').manifests.sort((a,b)=>a.displayLabel.localeCompare(b.displayLabel)).slice(60)
 const entries=selected.map((m,i)=>{
  const e=read('src/assets/exercises/'+m.file),alias=aliases[m.id]
  const u=alias?upstream.find(x=>x.id===alias[0]):[e.displayLabel,...(e.aliases??[])].map(s=>byName.get(norm(s))).find(Boolean)
  const base={order:i+61,id:e.id,name:e.displayLabel,exerciseFile:'src/assets/exercises/'+m.file,primary:e.primaryTargetMuscleGroups??[],secondary:e.secondaryTargetMuscleGroups??[],category:e.category??null,equipment:e.equipment??[],instructions:e.instructions??u?.instructions??[],sourceId:u?.id??null,sourcePage:u?'https://github.com/yuhonas/free-exercise-db/blob/main/exercises/'+encodeURIComponent(u.id)+'.json':null,referenceRole:alias?'related-equivalent-variant':'exact-name-or-alias',matchNotes:alias?.[1]??(u?'Named source entry matched to catalog label or explicit alias.':'No exact reference match; needs source research and variant review.'),status:u?'references-pending':'references-missing',references:u?(u.images??[]).slice(0,2).map((s,j)=>({url:'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'+s.split('/').map(encodeURIComponent).join('/'),file:'references/reference-'+(j+1)+'.jpg'})):[],rights:{display:'unverified',referenceBasedGeneration:'unverified',note:'Private draft only; original image authorship/reuse rights unresolved.'}}
  base.prompt=style+'\nEXERCISE: '+base.name+' ('+base.id+').\nPRIMARY ORANGE: '+base.primary.map(m=>m.muscleGroup).join(', ')+'.\nSECONDARY AMBER: '+base.secondary.filter(m=>!base.primary.some(p=>p.muscleGroup===m.muscleGroup)).map(m=>m.muscleGroup).join(', ')+'.\nINSTRUCTIONS: '+base.instructions.join(' ')+'\nVARIANT / REFERENCE ROLE: '+base.matchNotes
  return base
 })
 write(root+'/inventory.json',{catalogSize:selected.length+60,alreadyGenerated:60,requested:entries.length,ordering:'Frozen current displayLabel.localeCompare, records 61 onward',createdAt:new Date().toISOString(),entries})
 for(const e of entries)write(root+'/'+e.id+'/manifest.json',e)
 summary()
}
function inventory(){return read(root+'/inventory.json')}
function resolveNames(){
 const inv=inventory(),up=read('scripts/exercise-import/upstream.json')
 const key=s=>s.toLowerCase().replace(/leveragemachine/g,'machine').replace(/bodyweight|body only/g,'body').replace(/flyes?|flye/g,'fly').replace(/dumbbells/g,'dumbbell').replace(/biceps?/g,'bicep').replace(/triceps?/g,'tricep').replace(/rows/g,'row').replace(/pullups/g,'pull up').replace(/pushups/g,'push up').replace(/curls/g,'curl').replace(/squats/g,'squat').replace(/[^a-z0-9]/g,' ').split(/ +/).filter(x=>x&&!['with','the'].includes(x)).sort().join(' ')
 let count=0
 for(const e of inv.entries){
  if(e.references.length)continue
  const candidates=up.filter(u=>(u.images??[]).length&&key(e.name)===key(u.name))
  if(candidates.length!==1)continue
  const u=candidates[0]
  e.sourceId=u.id;e.sourcePage='https://github.com/yuhonas/free-exercise-db/blob/main/exercises/'+encodeURIComponent(u.id)+'.json';e.referenceRole='equivalent-name-token-normalization';e.matchNotes='Equivalent name/equipment after word-order and singular/plural normalization. Variant review remains required.';e.status='references-pending';e.instructions=e.instructions.length?e.instructions:u.instructions
  e.references=u.images.slice(0,2).map((s,j)=>({url:'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'+s.split('/').map(encodeURIComponent).join('/'),file:'references/reference-'+(j+1)+'.jpg'}))
  e.prompt=style+'\nEXERCISE: '+e.name+' ('+e.id+').\nPRIMARY ORANGE: '+e.primary.map(m=>m.muscleGroup).join(', ')+'.\nSECONDARY AMBER: '+e.secondary.filter(m=>!e.primary.some(p=>p.muscleGroup===m.muscleGroup)).map(m=>m.muscleGroup).join(', ')+'.\nINSTRUCTIONS: '+e.instructions.join(' ')+'\nVARIANT / REFERENCE ROLE: '+e.matchNotes
  write(root+'/'+e.id+'/manifest.json',e);count++
 }
 write(root+'/inventory.json',inv);console.log('Resolved equivalent reference names: '+count)
}
function resolveAliases(){
 const inv=inventory(),up=read('scripts/exercise-import/upstream.json');let count=0
 for(const line of fs.readFileSync('scripts/exercise-media/reference-aliases.tsv','utf8').trim().split('\n')){
  const [id,sourceId,note]=line.split('\t'),e=inv.entries.find(e=>e.id===id),u=up.find(u=>u.id===sourceId)
  if(!e||e.references.length)continue
  if(!(u?.images??[]).length){console.log('NO PHOTOS '+id+' ← '+sourceId);continue}
  e.sourceId=u.id;e.sourcePage='https://github.com/yuhonas/free-exercise-db/blob/main/exercises/'+encodeURIComponent(u.id)+'.json';e.referenceRole=note?'supporting-variant':'curated-equivalent-name';e.matchNotes=note??'Curated equivalent movement name/equipment; reference and generated motion require variant review.';e.status='references-pending';e.instructions=e.instructions.length?e.instructions:(note?[]:u.instructions)
  e.references=u.images.slice(0,2).map((s,j)=>({url:'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'+s.split('/').map(encodeURIComponent).join('/'),file:'references/reference-'+(j+1)+'.jpg'}))
  e.prompt=style+'\nEXERCISE: '+e.name+' ('+e.id+').\nPRIMARY ORANGE: '+e.primary.map(m=>m.muscleGroup).join(', ')+'.\nSECONDARY AMBER: '+e.secondary.filter(m=>!e.primary.some(p=>p.muscleGroup===m.muscleGroup)).map(m=>m.muscleGroup).join(', ')+'.\nINSTRUCTIONS: '+e.instructions.join(' ')+'\nCRITICAL VARIANT / REFERENCE ROLE: '+e.matchNotes
  write(root+'/'+e.id+'/manifest.json',e);count++
 }
 write(root+'/inventory.json',inv);console.log('Resolved curated aliases: '+count)
}
function summary(){
 const inv=inventory(),entries=[],missing=[],failed=[],generationErrors=[],pending=[]
 for(const e of inv.entries){const version=versionFor(e.id),dir=root+'/'+e.id+'/'+version;if(fs.existsSync(dir+'/export.json'))entries.push({order:e.order,id:e.id,name:e.name,primary:e.primary,secondary:e.secondary,video:e.id+'/'+version+'/demo.mp4',poster:e.id+'/'+version+'/poster.webp',review:e.id+'/'+version+'/review.json',sourceSheet:e.id+'/'+version+'/source-sheet.png',demonstratedVariant:e.demonstratedVariant??null,reviewStatus:fs.existsSync(dir+'/review.json')?read(dir+'/review.json').status:'draft-needs-review'});else if(!e.references.length)missing.push(e.id);else if(fs.existsSync(root+'/'+e.id+'/reference-error.json')&&!fs.existsSync(root+'/'+e.id+'/job.json'))failed.push(e.id);else if(fs.existsSync(root+'/'+e.id+'/generation-failed.json'))generationErrors.push(e.id);else pending.push(e.id)}
 const report={requested:inv.requested,completed:entries.length,missingReferences:missing,referenceErrors:failed,generationErrors,pending,entries,updatedAt:new Date().toISOString()}
 write(root+'/video-summary.json',report);console.log(JSON.stringify({requested:report.requested,completed:entries.length,missingReferences:missing.length,referenceErrors:failed.length,generationErrors:generationErrors.length,pending:pending.length}));return report
}
function resolveExternal(){
 const inv=inventory();let count=0
 for(const ref of read('scripts/exercise-media/external-references.json')){
  const e=inv.entries.find(e=>e.id===ref.id)
  if(!e||e.references.length)continue
  e.sourceId=null;e.sourcePage=ref.sourcePage;e.referenceRole=ref.role;e.matchNotes=ref.notes;e.status='references-pending'
  if(ref.demonstratedVariant)e.demonstratedVariant=ref.demonstratedVariant
  e.references=ref.images.map((image,j)=>({...(typeof image==='string'?{url:image}:image),file:'references/reference-'+(j+1)+'.jpg'}))
  e.prompt=style+'\nEXERCISE: '+e.name+' ('+e.id+').\nPRIMARY ORANGE: '+e.primary.map(m=>m.muscleGroup).join(', ')+'.\nSECONDARY AMBER: '+e.secondary.filter(m=>!e.primary.some(p=>p.muscleGroup===m.muscleGroup)).map(m=>m.muscleGroup).join(', ')+'.\nINSTRUCTIONS: '+e.instructions.join(' ')+'\nCRITICAL REFERENCE ROLE: '+e.matchNotes
  write(root+'/'+e.id+'/manifest.json',e);count++
 }
 write(root+'/inventory.json',inv);console.log('Resolved external references: '+count)
}
function refreshVariantPrompts(){
 const inv=inventory();let count=0
 for(const e of inv.entries){
  if(e.referenceRole!=='supporting-variant'||fs.existsSync(root+'/'+e.id+'/video-v1/prompt.txt'))continue
  const own=read(e.exerciseFile).instructions??[]
  // A related variant's original instructions can contradict the requested equipment.
  // Keep the catalog instructions and explicit adaptation notes, never the donor's recipe.
  e.instructions=own
  e.prompt=style+'\nEXERCISE: '+e.name+' ('+e.id+').\nPRIMARY ORANGE: '+e.primary.map(m=>m.muscleGroup).join(', ')+'.\nSECONDARY AMBER: '+e.secondary.filter(m=>!e.primary.some(p=>p.muscleGroup===m.muscleGroup)).map(m=>m.muscleGroup).join(', ')+'.\nINSTRUCTIONS: '+own.join(' ')+'\nCRITICAL VARIANT / REFERENCE ROLE: '+e.matchNotes
  const manifestFile=root+'/'+e.id+'/manifest.json'
  const existing=fs.existsSync(manifestFile)?read(manifestFile):null
  write(manifestFile,{...e,references:existing?.references??e.references})
  const file=root+'/'+e.id+'/job.json'
  if(fs.existsSync(file))write(file,{...read(file),prompt:e.prompt})
  count++
 }
 write(root+'/inventory.json',inv);console.log('Updated pending variant prompts: '+count)
}
function repairReferenceHashes(){
 let count=0
 for(const e of inventory().entries){
  const file=root+'/'+e.id+'/manifest.json',manifest=read(file)
  if(!manifest.references.length||manifest.references.some(r=>!fs.existsSync(root+'/'+e.id+'/'+r.file)))continue
  for(const r of manifest.references){const content=fs.readFileSync(root+'/'+e.id+'/'+r.file);r.sha256=hash(content);r.bytes=content.length}
  write(file,manifest)
  const exported=root+'/'+e.id+'/'+versionFor(e.id)+'/export.json'
  if(fs.existsSync(exported)){const x=read(exported);if(!x.referenceHashes?.length||x.referenceHashes.some(h=>!h)){write(exported,{...x,referenceHashes:manifest.references.map(r=>r.sha256),referenceHashesRecordedAt:new Date().toISOString()});count++}}
 }
 console.log('Backfilled reference hashes on '+count+' exports; media files unchanged')
}
async function download(){
 const inv=inventory(),queue=inv.entries.filter(e=>e.references.length),inflight=new Map()
 fs.mkdirSync(root+'/reference-cache',{recursive:true})
 async function fetchImage(url,localSource){
  if(localSource){await exec('magick',['identify',localSource]);return localSource}
  if(inflight.has(url))return inflight.get(url)
  const work=(async()=>{const file=root+'/reference-cache/'+hash(url)+'.jpg';if(!fs.existsSync(file)){await exec('curl',['-fLsS','--retry','1','--max-time','35',url,'-o',file+'.part']);await exec('magick',['identify',file+'.part']);fs.renameSync(file+'.part',file)}return file})()
  inflight.set(url,work);return work
 }
 let pointer=0,done=0
 await Promise.all(Array.from({length:8},async()=>{while(pointer<queue.length){const e=queue[pointer++];if(fs.existsSync(root+'/'+e.id+'/job.json'))continue;try{for(const r of e.references){const cache=await fetchImage(r.url,r.localSource),file=root+'/'+e.id+'/'+r.file;fs.mkdirSync(path.dirname(file),{recursive:true});if(!fs.existsSync(file))fs.copyFileSync(cache,file);r.sha256=hash(fs.readFileSync(file));r.bytes=fs.statSync(file).size}write(root+'/'+e.id+'/manifest.json',{...e,status:'rights-pending',references:e.references});write(root+'/'+e.id+'/job.json',{id:e.id,order:e.order,name:e.name,prompt:e.prompt,references:e.references.map(r=>path.resolve(root,e.id,r.file)),primary:e.primary,secondary:e.secondary});done++;if(done%10===0)console.log('References ready: '+done+'; latest '+e.order+' '+e.id)}catch(error){write(root+'/'+e.id+'/reference-error.json',{error:String(error),at:new Date().toISOString()});console.log('REFERENCE FAILED '+e.id)}}}))
 console.log('Reference pass complete');summary()
}
function jobs(limit=5){
 const settings=root+'/generation-settings.json'
 if(fs.existsSync(settings))limit=Math.max(1,Math.min(10,Number(read(settings).batchSize)||limit))
 const inv=inventory(),list=[]
 for(const e of prioritizeProgramExercises(inv.entries)){const job=root+'/'+e.id+'/job.json';if(fs.existsSync(job)&&!fs.existsSync(root+'/'+e.id+'/'+versionFor(e.id)+'/export.json')&&!fs.existsSync(root+'/'+e.id+'/generation-failed.json')){list.push({...read(job),hasSource:fs.existsSync(root+'/'+e.id+'/'+versionFor(e.id)+'/source-sheet.png')});if(JSON.stringify(list).length>50000&&list.length>1){list.pop();break}if(list.length>=limit)break}}
 console.log(JSON.stringify(list))
}
function encode(id){
 if(!inventory().entries.some(e=>e.id===id))throw Error('Unknown exercise ID')
 const e=read(root+'/'+id+'/manifest.json'),job=read(root+'/'+id+'/job.json'),dir=root+'/'+id+'/'+versionFor(id),sheet=dir+'/source-sheet.png'
 if(fs.existsSync(dir+'/export.json'))return
 const sequence=job.poseSequence??Array.from({length:16},(_,i)=>i)
 if(!Array.isArray(sequence)||sequence.length!==16||sequence.some(i=>!Number.isInteger(i)||i<0||i>15))throw Error('poseSequence must contain sixteen source-cell indices from 0 to 15')
 fs.mkdirSync(dir+'/frames',{recursive:true})
 execFileSync('magick',[sheet,'-crop','4x4@','+repage','-resize','512x512','-background','#f8f5ee','-gravity','center','-extent','512x512',dir+'/frames/pose-%02d.png'])
 if(fs.readdirSync(dir+'/frames').filter(s=>/^pose-\d+.png$/.test(s)).length!==16)throw Error('Expected sixteen source cells')
 fs.mkdirSync(dir+'/timeline',{recursive:true})
 for(const [position,index] of sequence.entries())fs.copyFileSync(dir+'/frames/pose-'+String(index).padStart(2,'0')+'.png',dir+'/timeline/pose-'+String(position).padStart(2,'0')+'.png')
 write(dir+'/timeline.json',{source:'source-sheet.png',poseSequence:sequence,poseDurationSeconds:0.25,interpolation:false})
 execFileSync('magick',[dir+'/timeline/pose-00.png','-quality','85',dir+'/poster.webp'])
 execFileSync('ffmpeg',['-v','error','-y','-framerate','4','-i',dir+'/timeline/pose-%02d.png','-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-r','24','-movflags','+faststart','-an',dir+'/demo.mp4'])
 const p=JSON.parse(execFileSync('ffprobe',['-v','error','-count_frames','-show_entries','stream=codec_name,width,height,pix_fmt,nb_read_frames,duration,r_frame_rate','-of','json',dir+'/demo.mp4'],{encoding:'utf8'})).streams[0]
 if(p.width!==512||p.height!==512||p.codec_name!=='h264'||Number(p.duration)!==4||Number(p.nb_read_frames)!==96)throw Error('Invalid media export')
 execFileSync('ffmpeg',['-v','error','-i',dir+'/demo.mp4','-f','null','-'])
 write(dir+'/export.json',{id,sourceSha256:hash(fs.readFileSync(sheet)),generator:'built-in image_gen',sourcePoses:16,poseSequence:sequence,distinctPosesPerSecond:4,containerFps:24,temporalInterpolation:false,sourceCells:'Aspect ratio preserved; letterboxed if necessary',muscleHighlights:{primary:'orange',secondary:'amber',accuracy:'Approximate schematic overlays on clothing'},referenceHashes:e.references.map(r=>hash(fs.readFileSync(root+'/'+id+'/'+r.file))),readyForProduction:false,bytes:fs.statSync(dir+'/demo.mp4').size,...p})
 if(!fs.existsSync(dir+'/review.json'))write(dir+'/review.json',{id,status:'draft-needs-review',readyForProduction:false,sourceSheetInspected:false,motionApproved:false,anatomyApproved:false,findings:['Encoding verified; individual pose/contact, loop and highlight placement review remains pending.'],referenceRights:'rights-pending'})
 console.log('EXPORTED '+e.order+' '+id)
}
function montage(limit=5){
 const inv=inventory(),args=[]
 let count=0
 for(const e of prioritizeProgramExercises(inv.entries)){const file=root+'/'+e.id+'/job.json';if(fs.existsSync(file)&&!fs.existsSync(root+'/'+e.id+'/'+versionFor(e.id)+'/export.json')&&!fs.existsSync(root+'/'+e.id+'/generation-failed.json')){const j=read(file);for(const r of j.references)args.push('-label',j.order+'. '+j.id,r);if(++count>=limit)break}}
 if(!count)throw Error('No prepared jobs')
 execFileSync('magick',['montage','-font','/usr/share/fonts/liberation/LiberationSans-Regular.ttf','-pointsize','12',...args,'-thumbnail','280x175','-background','#faf7f1','-geometry','290x200+3+3','-tile','4x',root+'/reference-contact-sheet.jpg'])
 console.log('Prepared reference contact sheet for '+count+' exercises')
}
const [command,...args]=process.argv.slice(2)
if(command==='plan')plan()
else if(command==='download')await download()
else if(command==='jobs')jobs(Number(args[0]??5))
else if(command==='encode')encode(args[0])
else if(command==='summary')summary()
else if(command==='montage')montage(Number(args[0]??5))
else if(command==='resolve-names')resolveNames()
else if(command==='resolve-aliases')resolveAliases()
else if(command==='resolve-external')resolveExternal()
else if(command==='refresh-variant-prompts')refreshVariantPrompts()
else if(command==='repair-reference-hashes')repairReferenceHashes()
else throw Error('Use plan, download, jobs [limit], encode <exercise-id>, or summary')
