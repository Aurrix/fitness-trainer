import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH??'/home/aurrix/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell'})
const errors=[]
async function openProgram(page){
 page.setDefaultTimeout(45000)
 page.on('pageerror',error=>errors.push(error.message))
 await page.goto('http://127.0.0.1:5176/library/programs',{waitUntil:'domcontentloaded',timeout:90000})
 await page.getByRole('heading',{name:'Programs',exact:true}).waitFor()
 const close=page.locator('.overlay').getByRole('button',{name:'Close',exact:true})
 try{await close.waitFor({timeout:3000});await close.click()}catch{}
 await page.getByRole('searchbox').fill('PHUL — Liftosaur')
 await page.locator('.program-card').filter({has:page.getByRole('heading',{name:'PHUL — Liftosaur',exact:true})}).getByRole('button',{name:'Open',exact:true}).click()
 return page.getByRole('dialog',{name:'PHUL — Liftosaur',exact:true})
}
async function playing(video){await video.evaluate(element=>new Promise((resolve,reject)=>{
 const deadline=Date.now()+15000
 const check=()=>{if(!element.paused&&element.currentTime>0.05)return resolve(true);if(Date.now()>deadline)return reject(new Error(`Video did not autoplay: readyState=${element.readyState}, error=${element.error?.code}`));setTimeout(check,50)}
 check()
}))}
try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference'})
 const dialog=await openProgram(page)
 const previews=dialog.locator('.program-exercise-preview')
 const first=previews.first().locator('video')
 await playing(first)
 const missingIndex=JSON.parse(fs.readFileSync('src/assets/programms/liftosaur-phul.json')).engine.sections[0].exercises.findIndex(ex=>!JSON.parse(fs.readFileSync('src/assets/exercise-media/index.json'))[ex.exerciseId])
 assert.ok(missingIndex>=0)
 assert.equal(await previews.nth(missingIndex).locator('.exercise-muscle-maps svg').count(),2)
 const secondVideo=dialog.locator('.program-exercise-preview video').nth(1)
 await secondVideo.scrollIntoViewIfNeeded()
 await playing(secondVideo)
 // Keep both full preview rows in the sheet's visible scroll area.
 await first.scrollIntoViewIfNeeded()
 await playing(first)
 await playing(secondVideo)
 const initialTime=await first.evaluate(video=>video.currentTime)
 await page.waitForTimeout(300)
 assert.notEqual(await first.evaluate(video=>video.currentTime),initialTime)
 await previews.first().click()
 const detail=page.getByRole('dialog').last()
 await playing(detail.locator('.exercise-gallery video'))
 await page.waitForFunction(()=>[...document.querySelectorAll('.program-exercise-preview video')].every(video=>video.paused))
 await detail.getByRole('button',{name:'Close',exact:true}).click()
 await playing(first)
 await dialog.locator('.program-detail-content').evaluate(element=>{element.scrollTop=element.scrollHeight})
 await first.evaluate(video=>new Promise((resolve,reject)=>{const deadline=Date.now()+3000;const check=()=>video.paused?resolve(true):Date.now()>deadline?reject(new Error('Offscreen preview kept playing')):setTimeout(check,50);check()}))
 await first.scrollIntoViewIfNeeded()
 await playing(first)
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.waitForFunction(()=>[...document.querySelectorAll('.program-exercise-preview video')].every(video=>video.paused))
 fs.mkdirSync('.tmp/program-media',{recursive:true})
 await page.screenshot({path:'.tmp/program-media/previews-and-fallbacks.png'})
 const broken=await browser.newPage({viewport:{width:390,height:844}})
 await broken.route('**/exercise-media/barbell-bench-press/**/demo.mp4',route=>route.fulfill({status:404,body:''}))
 const brokenDialog=await openProgram(broken)
 await brokenDialog.locator('.program-exercise-preview').first().locator('.exercise-muscle-maps').waitFor()
 assert.equal(await brokenDialog.locator('.program-exercise-preview').first().locator('video').count(),0)
 assert.deepEqual(errors,[])
 console.log('Passed simultaneous visible preview autoplay, advancing frames, offscreen pause, detail takeover/resume, reduced motion, and missing/broken-video muscle fallbacks.')
}finally{await browser.close()}
