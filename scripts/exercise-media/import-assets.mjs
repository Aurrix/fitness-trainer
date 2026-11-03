import fs from 'node:fs'
import path from 'node:path'
import {selectedVersion} from './versions.mjs'
import {programCoverage} from './program-coverage.mjs'

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'))
const rejected=review=>['rejected','revision-required'].includes(review.status)
const dry=process.argv.includes('--dry-run'),target='src/assets/exercise-media/index.json'
const index=fs.existsSync(target)?read(target):{}
const roots=['.exercise-media-references/first-10','.exercise-media-references/next-50','.exercise-media-references/remaining']
for(const root of roots){
 for(const id of fs.readdirSync(root)){
  // A queued replacement must not keep an explicitly rejected older clip visible.
  const mappedVersion=index[id]?.video?.match(/\/(video-v[1-9]\d*)\//)?.[1]
  const mappedReview=mappedVersion?`${root}/${id}/${mappedVersion}/review.json`:null
  if(mappedReview&&fs.existsSync(mappedReview)&&rejected(read(mappedReview)))delete index[id]
  const version=selectedVersion(root+'/'+id,id==='adductor-groin'?'video-v2':'video-v1'),dir=path.join(root,id,version)
  if(!fs.existsSync(dir+'/export.json')||!fs.existsSync(dir+'/demo.mp4')||!fs.existsSync(dir+'/poster.webp'))continue
  const review=fs.existsSync(dir+'/review.json')?read(dir+'/review.json'):{}
  if(rejected(review)){delete index[id];continue}
  // Encoding may finish during another batch's import. New clips/replacements
  // wait for inspection; preserve previously delivered legacy draft mappings.
  if(review.sourceSheetInspected!==true&&(mappedVersion!==version||!index[id]))continue
  index[id]={video:`exercise-media/${id}/${version}/demo.mp4`,poster:`exercise-media/${id}/${version}/poster.webp`}
  if(!dry){
   const dest=`public/exercise-media/${id}/${version}`
   fs.mkdirSync(dest,{recursive:true})
   for(const file of ['demo.mp4','poster.webp']){
    if(fs.existsSync(dest+'/'+file)){
     if(!fs.readFileSync(dest+'/'+file).equals(fs.readFileSync(dir+'/'+file)))throw Error('Conflicting asset '+id)
    }else fs.copyFileSync(dir+'/'+file,dest+'/'+file)
   }
  }
 }
}
if(!dry){const temporary=target+'.'+process.pid+'.tmp';fs.writeFileSync(temporary,JSON.stringify(index,null,2)+'\n');fs.renameSync(temporary,target)}
console.log(`${Object.keys(index).length} exercise media entries${dry?' (dry run)':''}`)
if(!dry){
 const report=programCoverage()
 fs.writeFileSync('.exercise-media-references/program-coverage.json',JSON.stringify(report,null,2)+'\n')
 console.log(`Program exercises: ${report.covered}/${report.uniqueExercises}; ${report.missing} missing; ${report.programsCovered}/${report.programs} programs covered`)
}
