import { build } from 'esbuild'
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import path from 'node:path'
// UI and infrastructure entry points are intentionally unavailable to the local interpreter.
// Throwing exports make accidental use fail explicitly rather than silently changing training rules.
const boundaries = /\/(ducks\/thunks|models\/(state|editProgram)|api\/service|migrations\/migrations|utils\/(dialog|exporter|liveActivityManager|log))$/
const excluded = new Set()
await build({entryPoints:['scripts/program-import/entry.ts'],bundle:true,format:'esm',platform:'browser',outfile:'tests/reference/program.mjs',logLimit:5,banner:{js:'/* program interpreter, AGPL-3.0. Upstream commit 421ca47fc13031c5c1df894055525cf96e45a18c. See LICENSE.txt and third-party/program/NOTICE.txt. */'},define:{__HOST__:'""',__ENV__:'"local"',__VERSION__:'"local"',__COMMIT_HASH__:'"421ca47"'},treeShaking:true,plugins:[{name:'headless-boundaries',setup(b){
 b.onResolve({filter:/.*/},args=>{
  if(!args.path.startsWith('.')) return
  const absolute=path.resolve(args.resolveDir,args.path)
  if(boundaries.test(absolute)){excluded.add(absolute.split('/upstream/')[1]);return {path:absolute,namespace:'headless'}}
 })
 b.onLoad({filter:/.*/,namespace:'headless'},args=>{
  const text=readFileSync(args.path+'.ts','utf8')
  const names=[...text.matchAll(/export\s+(?:async\s+)?(?:function|class|const|let)\s+(\w+)/g)].map(m=>m[1])
  return {contents:names.map(name=>name==='getLatestMigrationVersion'?`export const ${name}=()=>"local-pinned";`:`export const ${name}=(...args)=>{throw new Error("Unavailable headless boundary: ${name}")};`).join('\n'),loader:'js'}
 })
}}]})
writeFileSync('scripts/program-import/headless-boundaries.json',JSON.stringify([...excluded].sort(),null,2)+'\n')

copyFileSync('third-party/program/LICENSE','tests/reference/LICENSE.txt')
