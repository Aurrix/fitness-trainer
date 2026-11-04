import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
mkdirSync('.tmp/workout-refresh-concepts',{recursive:true})
async function waitForApp(page,predicate){const deadline=Date.now()+60000;while(!await page.evaluate(predicate)){if(Date.now()>deadline)throw new Error('App state did not become ready');await page.waitForTimeout(100)}}
const appUrl = process.env.APP_URL ?? 'http://localhost:5174'
let testPage
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH??'/home/aurrix/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell'})
try{
 const page=await browser.newPage({viewport:{width:390,height:844}})
 testPage=page
 console.log('Opening workout')
 page.setDefaultTimeout(60000)
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)})
 page.on('response',r=>{if(r.status()>=400)console.log('HTTP',r.status(),r.url())})
 await page.route('**/*',route=>route.request().resourceType()==='image'?route.abort():route.continue())
 await page.goto(`${appUrl}/workout`,{waitUntil:'domcontentloaded',timeout:90000})
 await page.getByRole('heading',{name:'Fitness Trainer'}).waitFor()
 const appModule=await (await page.request.get(`${appUrl}/src/App.tsx`)).text()
 const storeUrl=appModule.match(/from ["']([^"']*\/src\/stores\/useAppStore\.ts[^"']*)["']/)?.[1]??'/src/stores/useAppStore.ts'
 const trainingUrl=appModule.match(/from ["']([^"']*\/src\/lib\/training\/store\.ts[^"']*)["']/)?.[1]??'/src/lib/training/store.ts'
 await page.evaluate(({storeUrl,trainingUrl})=>{window.__testStoreUrl=storeUrl;window.__testTrainingUrl=trainingUrl},{storeUrl,trainingUrl})
 const close=page.locator('.overlay').getByRole('button',{name:'Close',exact:true});try{await close.waitFor({timeout:5000});await close.click()}catch{}
 await waitForApp(page,async()=>{const {useAppStore}=await import(window.__testStoreUrl);return useAppStore.getState().isHydrated})
 const count=await page.evaluate(async()=>{const {getContentLibrary}=await import('/src/lib/content.ts');const {useAppStore}=await import(window.__testStoreUrl);useAppStore.getState().setMainProgramId('phul');return getContentLibrary().programs.length})
 assert.ok(count > 0)
 await page.getByRole('button',{name:'Start this day',exact:true}).click()
 const startConfirmation=page.getByRole('button',{name:'Start day',exact:true});try{await startConfirmation.waitFor({timeout:5000});await startConfirmation.click()}catch{}
 const setup=page.getByRole('dialog',{name:/Set up PHUL/})
 await Promise.race([
  setup.waitFor({timeout:30000}),
  page.locator('.workout-card__up-next').first().waitFor({timeout:30000}),
 ])
 if(await setup.isVisible()){
  const inputs=setup.getByRole('spinbutton')
  for(let i=0;i<await inputs.count();i++){const field=inputs.nth(i),label=await field.getAttribute('aria-label');await field.fill(label.includes('equipment step')?'2.5':label.includes('one rep max')?'100':'40')}
  await setup.getByRole('button',{name:'Confirm & start workout'}).click()
 }


 const summary=page.locator('.workout-muscles')
 const zoom=page.getByRole('button',{name:'Open muscle coverage full screen'})
 assert.ok(await zoom.locator('svg').evaluate(n=>n.getBoundingClientRect().width>=15))
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900})
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
  assert.ok(await summary.locator('.workout-muscles__panel').evaluate(n=>n.getBoundingClientRect().height<220))
 }
 await page.setViewportSize({width:390,height:844})
 const initialColor=await summary.locator('path#chest').first().getAttribute('fill')
 assert.ok(['#fff0b3','#efc34c'].includes(initialColor))
 await summary.locator('path#chest').first().click({force:true})
 await page.locator('.exercise-sheet').waitFor()
 assert.ok((await page.locator('.exercise-sheet').innerText()).includes('Add Chest'))
 await page.locator('.exercise-sheet').getByRole('button',{name:'Close',exact:true}).click()
 await zoom.click()
 const dialog=page.getByRole('dialog',{name:'Muscle coverage',exact:true})
 await dialog.waitFor()
 assert.ok(await dialog.evaluate(n=>n.matches(':modal')))
 assert.equal(Math.round((await dialog.boundingBox()).height),844)
 await page.keyboard.press('Escape')
 await dialog.waitFor({state:'detached'})
 assert.ok(await zoom.evaluate(n=>n===document.activeElement))
 await zoom.click()
 await dialog.locator('path#chest').first().click({force:true})
 await dialog.waitFor({state:'detached'})
 await page.locator('.exercise-sheet').waitFor()
 assert.ok((await page.locator('.exercise-sheet').innerText()).includes('Add Chest'))
 const picker=page.locator('.exercise-sheet')
 const select=picker.getByRole('button',{name:/^Select /}).first()
 await select.click()
 await picker.getByRole('button',{name:/^Add /}).last().click()
 await picker.waitFor({state:'detached'})
 const first=page.locator('[data-workout-row-key]').first()
 await first.getByRole('button',{name:/^Expand /}).click()
 const cell=first.locator('.workout-table__set-cell').first()
 await cell.getByRole('textbox',{name:/weight in kg/}).fill('40')
 await cell.getByRole('textbox',{name:/ reps$/}).fill('8')
 await cell.getByRole('button',{name:/^Next (?!time for)/}).click()
 const dismiss=page.getByRole('button',{name:'Dismiss rest timer',exact:true})
 if(await dismiss.count())await dismiss.click()
 await page.waitForFunction(()=>!['#fff0b3','#efc34c'].includes(document.querySelector('.workout-muscles path#chest')?.getAttribute('fill')))
 await summary.scrollIntoViewIfNeeded()
 await page.screenshot({path:'.tmp/workout-refresh-concepts/implemented-mobile.png',fullPage:true})
 await zoom.click()
 await page.screenshot({path:'.tmp/workout-refresh-concepts/implemented-fullscreen.png'})
 await dialog.getByRole('button',{name:'Close muscle coverage'}).click()
 assert.deepEqual(errors,[])
 console.log('Passed responsive summary, target-to-worked colors, muscle quick add from both maps, full-screen size, Escape, focus restoration, exercise addition and logging.')
}catch(error){if(testPage){console.log((await testPage.locator('body').innerText()).slice(-4000));await testPage.screenshot({path:'.tmp/workout-refresh-concepts/implementation-failure.png',fullPage:true})}throw error}finally{await browser.close()}
