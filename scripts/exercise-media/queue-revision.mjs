import fs from 'node:fs'
import {selectedVersion} from './versions.mjs'

const id=process.argv.slice(2).find(arg=>!arg.startsWith('--'))
const dry=process.argv.includes('--dry-run'),root='.exercise-media-references/remaining'
const inventory=JSON.parse(fs.readFileSync(root+'/inventory.json','utf8'))
if(!inventory.entries.some(e=>e.id===id))throw Error('Supply a remaining-catalog exercise ID')
const directory=root+'/'+id,previous=selectedVersion(directory)
if(!fs.existsSync(directory+'/'+previous+'/export.json')){console.log('Already awaiting export: '+id+' '+previous);process.exit(0)}
const review=JSON.parse(fs.readFileSync(directory+'/'+previous+'/review.json','utf8'))
if(!['rejected','revision-required'].includes(review.status))throw Error('Selected version is not marked for revision')
const next=1+Math.max(...fs.readdirSync(directory).filter(s=>/^video-v[1-9]\d*$/.test(s)).map(s=>Number(s.slice(7))))
const outputVersion='video-v'+next,jobFile=directory+'/job.json'
const job=JSON.parse(fs.readFileSync(jobFile,'utf8'))
const originalPrompt=fs.readFileSync(directory+'/'+previous+'/prompt.txt','utf8').trim()
const corrections={
 'car-drivers':'Keep a fixed frontal camera and body posture throughout. Turn the plate with both hands without rotating or mirroring the body. One steering cycle: neutral, turn gently left, neutral, turn gently right, neutral. Final pose matches initial pose.',
 'car-deadlift':'Start and end already gripping BOTH frame handles with hips/knees flexed at the bottom. Lift once and lower once, hands stay attached throughout. Never show standing with released hands or extra dips. Preserve fixed rear pivot and frame lengths.',
 'drop-push':'Both boxes remain rigid, identical and fixed in place. One cycle: supported on boxes, release hands, land hands on floor and absorb through elbows, press upward, return hands to the same boxes. No box size/height changes, replacement boxes, or sideways camera reversal.',
 'dumbbell-bicep-curl':'Use a plain ivory studio without gym equipment behind the person. Keep precisely the same fixed frontal camera for ALL sixteen frames, including the final row. Both elbows curl then extend once; first and final pose match.',
 'dumbbell-chest-supported-row':'Bench and body face the SAME direction in ALL sixteen cells. Choose one rear three-quarter camera exposing back and never reverse it. Chest stays on bench, feet planted, dumbbells row to ribs and return down once; last pose matches first.',
 'dumbbell-clean':'Frame 1 and 16 are BOTH the same floor-level clean setup with knees/hips bent and hands gripping dumbbells. No introductory upright pose. Progress floor pull, hip extension, turnover, squat catch, stand front rack, controlled lowering to hang, hinge back to floor. Maintain hand/weight contacts; never jump from floor to standing at loop boundary.',
 'dumbbell-curl-21s':'Override the generic single-rep phase plan: show the THREE phase shapes, not all21 repetitions. Keep both upper arms fixed, camera frontal. Frame elbow-flexion angles: 1=0,2=45,3=90,4=45,5=0 (lower half);6=45 transition,7=90,8=140,9=90 (upper half);10=45 transition,11=0,12=45,13=90,14=140,15=70,16=0 (full range). First and last match. Do not substitute one ordinary full-range curl.'
}
const prompt=originalPrompt+'\nREVISION PRIORITY: Correct the inspected defects: '+(review.findings??[]).join(' ')+'\n'+(corrections[id]??'Preserve one camera, body orientation, rigid equipment and contact points. Show the correct named movement with matching first/last working poses; no setup/exit or mirrored side changes.')
if(!dry){
 const updated={...job,prompt,outputVersion,revisionOf:previous,revisionQueuedAt:new Date().toISOString()}
 fs.writeFileSync(jobFile+'.tmp',JSON.stringify(updated,null,2)+'\n');fs.renameSync(jobFile+'.tmp',jobFile)
 const failure=directory+'/generation-failed.json'
 if(fs.existsSync(failure))fs.renameSync(failure,directory+'/'+previous+'/generation-failed-'+Date.now()+'.json')
}
console.log(JSON.stringify({id,previous,outputVersion,dryRun:dry,reason:review.findings}))
