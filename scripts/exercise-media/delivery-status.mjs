import fs from 'node:fs'
import {selectedVersion} from './versions.mjs'

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'))
const rejected=review=>['rejected','revision-required'].includes(review.status)
const catalog=read('src/assets/exercises/index.json').manifests,index=read('src/assets/exercise-media/index.json')
const roots=['.exercise-media-references/first-10','.exercise-media-references/next-50','.exercise-media-references/remaining']
const missing=[],revisions=[],invalid=[]
let delivered=0
for(const exercise of catalog){
 const media=index[exercise.id],mappedVersion=media?.video?.match(/\/(video-v[1-9]\d*)\//)?.[1]
 let revision=false,mappedRejected=false
 for(const root of roots){
  const directory=`${root}/${exercise.id}`,version=selectedVersion(directory,exercise.id==='adductor-groin'?'video-v2':'video-v1')
  const reviewFile=`${directory}/${version}/review.json`,review=fs.existsSync(reviewFile)?read(reviewFile):null
  const jobFile=directory+'/job.json',job=fs.existsSync(jobFile)?read(jobFile):null
  if((review&&rejected(review))||job?.revisionOf)revision=true
  const mappedReview=mappedVersion?`${directory}/${mappedVersion}/review.json`:null
  if(mappedReview&&fs.existsSync(mappedReview)&&rejected(read(mappedReview)))mappedRejected=true
 }
 const available=media&&!mappedRejected&&fs.existsSync('public/'+media.video)&&fs.existsSync('public/'+media.poster)
 if(available)delivered++
 else {missing.push(exercise.id);if(media)invalid.push(exercise.id);if(revision)revisions.push(exercise.id)}
}
const report={catalog:catalog.length,delivered,missing:missing.length,revisionRequired:revisions.length,invalidMappings:invalid.length,missingIds:missing,revisionIds:revisions,invalidIds:invalid,checkedAt:new Date().toISOString()}
if(process.argv.includes('--write'))fs.writeFileSync('.exercise-media-references/delivery-status.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(process.argv.includes('--details')?report:{catalog:report.catalog,delivered,missing:missing.length,revisionRequired:revisions.length,invalidMappings:invalid.length}))
