import {selectedVersion} from './versions.mjs'
import fs from 'node:fs'
import path from 'node:path'
const [id,source]=process.argv.slice(2)
if(!id||!source)throw Error('Usage: save-source <exercise-id> <generated-png>')
const root='.exercise-media-references/remaining',inv=JSON.parse(fs.readFileSync(root+'/inventory.json'))
if(!inv.entries.some(e=>e.id===id))throw Error('Unknown ID')
const job=JSON.parse(fs.readFileSync(root+'/'+id+'/job.json')),dir=root+'/'+id+'/'+selectedVersion(root+'/'+id)
fs.mkdirSync(dir,{recursive:true})
if(fs.existsSync(dir+'/source-sheet.png'))throw Error('Source exists; preserve existing version')
fs.copyFileSync(source,dir+'/source-sheet.png')
fs.writeFileSync(dir+'/prompt.txt',job.prompt+'\n')
fs.writeFileSync(dir+'/generation.json',JSON.stringify({id,source:path.resolve(source),generator:'built-in image_gen',references:job.references,referenceSheetInspected:true},null,2)+'\n')
console.log('Saved source '+id)
