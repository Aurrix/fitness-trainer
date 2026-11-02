import {chromium} from '@playwright/test'
import fs from 'node:fs'
import assert from 'node:assert/strict'
const root='.exercise-media-references/remaining'
const snapshot=JSON.parse(fs.readFileSync(root+'/video-summary.json'))
assert.ok(snapshot.completed>=24)
for(const e of snapshot.entries){for(const file of [e.video,e.poster,e.review])assert.ok(fs.existsSync(root+'/'+file),file);const x=JSON.parse(fs.readFileSync(root+'/'+e.video.slice(0,e.video.lastIndexOf('/'))+'/export.json'));assert.equal(x.width,512);assert.equal(x.height,512);assert.equal(Number(x.duration),4);assert.equal(x.codec_name,'h264');assert.ok(x.referenceHashes?.length&&x.referenceHashes.every(h=>/^[a-f0-9]{64}$/.test(h)),e.id+' reference provenance')}
const executablePath=process.argv.find(a=>a.startsWith('--chromium='))?.slice('--chromium='.length)
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})})
try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'})
 const errors=[];page.on('pageerror',e=>errors.push(String(e)))
 await page.routeWebSocket('**/*',ws=>ws.close())
 await page.route('**/video-summary.json',r=>r.fulfill({json:snapshot}))
 await page.goto('http://localhost:5175/.exercise-media-references/remaining/index.html')
 await page.waitForFunction(()=>document.querySelectorAll('article').length===24)
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
 assert.ok(await page.locator('video').evaluateAll(v=>v.every(x=>x.paused&&x.loop&&x.muted&&x.preload==='none')))
 await page.locator('#load').evaluate(b=>b.click())
 assert.equal(await page.locator('article').count(),Math.min(48,snapshot.completed))
 await page.locator('#search').fill('barbell curl')
 assert.ok(await page.locator('article').count()>0)
 assert.ok(await page.locator('h2').allTextContents().then(a=>a.every(s=>/barbell/i.test(s)&&/curl/i.test(s))))
 const v=page.locator('video').first()
 await v.evaluate(v=>new Promise((resolve,reject)=>{v.onloadeddata=resolve;v.onerror=reject;v.preload='auto';v.load()}))
 assert.equal(await v.evaluate(v=>v.duration),4)
 await page.locator('#resume').click();await page.waitForTimeout(600)
 assert.ok(await v.evaluate(v=>!v.paused&&v.currentTime>0))
 await page.locator('#pause').click();assert.ok(await page.locator('video').evaluateAll(a=>a.every(v=>v.paused)))
 await page.locator('#speed').selectOption('0.5');assert.equal(await v.evaluate(v=>v.playbackRate),.5)
 const variant=snapshot.entries.find(e=>e.demonstratedVariant)
 if(variant){await page.locator('#search').fill(variant.id);assert.equal(await page.locator('article').count(),1);assert.ok((await page.locator('article').innerText()).includes('This preview demonstrates: '+variant.demonstratedVariant))}
 await page.locator('#search').fill('missing-exercise-zzzz');assert.equal(await page.locator('video').count(),0)
 await page.locator('#search').fill('');await page.setViewportSize({width:320,height:740});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:root+'/gallery-mobile.png'})
 await page.setViewportSize({width:1280,height:960});await page.screenshot({path:root+'/gallery-desktop.png'})
 assert.deepEqual(errors,[])
 fs.writeFileSync(root+'/browser-verification.json',JSON.stringify({passed:true,snapshotCompleted:snapshot.completed,checkedAt:new Date().toISOString(),checks:['export files and metadata','initial 24-card bound','progressive append','token search','actual media load/play','muted looping attributes','reduced-motion initial pause','pause/resume','speed','empty results','320/390px overflow','desktop','no runtime errors']},null,2)+'\n')
 console.log('PASS: '+snapshot.completed+' completed exports audited; responsive gallery, progressive loading and playback verified.')
}finally{await browser.close()}
