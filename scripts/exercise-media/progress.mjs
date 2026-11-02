import fs from 'node:fs'
import {setTimeout} from 'node:timers/promises'

const root='.exercise-media-references/remaining'
const inventory=JSON.parse(fs.readFileSync(root+'/inventory.json','utf8'))
while(true){
 let completed=0,failed=0
 for(const e of inventory.entries){
  if(fs.existsSync(root+'/'+e.id+'/video-v1/export.json'))completed++
  else if(fs.existsSync(root+'/'+e.id+'/generation-failed.json'))failed++
 }
 console.log(`${completed}/${inventory.requested} additional exercise drafts exported; ${inventory.requested-completed} remaining${failed?`; ${failed} failed attempts`:''}.`)
 if(completed===inventory.requested)break
 await setTimeout(55000)
}
