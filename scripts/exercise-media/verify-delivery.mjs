import fs from 'node:fs'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {selectedVersion} from './versions.mjs'
import {programCoverage} from './program-coverage.mjs'

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'))
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const catalog=read('src/assets/exercises/index.json').manifests
const catalogIds=new Set(catalog.map(e=>e.id)),index=read('src/assets/exercise-media/index.json')
const args=process.argv.slice(2),complete=args.includes('--require-complete')
const programs=args.includes('--programs')?programCoverage():null
const ids=programs?programs.exercises.map(e=>e.id):args.includes('--all')||complete?Object.keys(index):args.filter(a=>!a.startsWith('--'))
assert.ok(ids.length,'Supply exercise IDs, --all, or --all --require-complete')
if(programs)assert.ok(programs.complete,'Program media incomplete: '+programs.missing+' exercises remain')
if(complete&&!programs)for(const id of catalogIds)assert.ok(index[id],'Missing exercise media: '+id)
const roots=['.exercise-media-references/remaining','.exercise-media-references/next-50','.exercise-media-references/first-10']
const checked=[]
for(const id of ids){
 assert.ok(catalogIds.has(id),'Unknown catalog ID: '+id)
 let source=null,metadata=null,review=null
 for(const root of roots){
  const version=selectedVersion(root+'/'+id,id==='adductor-groin'?'video-v2':'video-v1')
  const directory=root+'/'+id+'/'+version
  if(fs.existsSync(directory+'/export.json')){source=directory;metadata=read(directory+'/export.json');review=fs.existsSync(directory+'/review.json')?read(directory+'/review.json'):null;break}
 }
 const held=review&&['rejected','revision-required'].includes(review.status),entry=index[id]
 if(held)assert.equal(entry,undefined,'Rejected clip still mapped: '+id)
 else assert.ok(entry,'Eligible clip missing from index: '+id)
 const video=held?source+'/demo.mp4':'public/'+entry.video
 const poster=held?source+'/poster.webp':'public/'+entry.poster
 assert.ok(fs.statSync(video).size>0,'Empty video: '+id)
 assert.ok(fs.statSync(poster).size>0,'Empty poster: '+id)
 const stream=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-count_frames','-show_entries','stream=codec_name,width,height,pix_fmt,nb_read_frames,duration','-of','json',video],{encoding:'utf8'})).streams[0]
 assert.equal(stream.codec_name,'h264',id+' codec')
 assert.equal(stream.pix_fmt,'yuv420p',id+' pixel format')
 assert.ok(Number(stream.duration)>0&&Number(stream.nb_read_frames)>0,id+' duration/frames')
 if(metadata){
  assert.equal(stream.width,metadata.width,id+' width');assert.equal(stream.height,metadata.height,id+' height')
  assert.equal(Number(stream.duration),Number(metadata.duration),id+' duration')
  assert.equal(Number(stream.nb_read_frames),Number(metadata.nb_read_frames),id+' frame count')
  if(!held){assert.equal(hash(video),hash(source+'/demo.mp4'),id+' video copy');assert.equal(hash(poster),hash(source+'/poster.webp'),id+' poster copy')}
 }else{assert.ok(stream.width>0&&stream.height>0,id+' manual media dimensions')}
 execFileSync('ffmpeg',['-v','error','-xerror','-i',video,'-map','0:v:0','-f','null','-'],{stdio:'pipe'})
 const image=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height','-of','json',poster],{encoding:'utf8'})).streams[0]
 assert.ok(image?.width>0&&image?.height>0,id+' poster decode')
 checked.push({id,status:held?'held-for-revision':'app-mapped',width:stream.width,height:stream.height,duration:Number(stream.duration)})
}
console.log(JSON.stringify({passed:true,checked:checked.length,appMapped:checked.filter(x=>x.status==='app-mapped').length,held:checked.filter(x=>x.status==='held-for-revision').length,catalog:catalog.length,completeCatalogRequired:complete&&!programs,completeProgramsRequired:!!programs,programCount:programs?.programs}))
