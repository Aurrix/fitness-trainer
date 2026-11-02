import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
const source = process.argv[2]
if (!source) throw new Error('Usage: node scripts/program-import/vendor.mjs <upstream-checkout>')
const destination = 'third-party/liftosaur/upstream'
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8' }).trim()
const lockPath = 'scripts/program-import/upstream-lock.json'
if (existsSync(lockPath) && JSON.parse(readFileSync(lockPath)).commit !== commit) throw new Error('Upstream revision changed; review and update the lock explicitly.')
mkdirSync(destination, { recursive: true })
for (const item of ['src', 'programs', 'LICENSE', 'package.json', 'yarn.lock', 'tsconfig.json']) {
 if (existsSync(path.join(source,item))) cpSync(path.join(source,item),path.join(destination,item),{recursive:true})
}
const programs = readdirSync(path.join(source,'programs/builtin')).filter(n=>n.endsWith('.md')).sort().map(file=>{
 const content=readFileSync(path.join(source,'programs/builtin',file),'utf8')
 if (!content.includes('```liftoscript')) throw new Error(`No executable definition: ${file}`)
 return {file,sha256:createHash('sha256').update(content).digest('hex')}
})
writeFileSync(lockPath,JSON.stringify({repository:'https://github.com/astashov/liftosaur',commit,programs},null,2)+'\n')
console.log(`Pinned ${programs.length} programs and upstream sources at ${commit}`)
