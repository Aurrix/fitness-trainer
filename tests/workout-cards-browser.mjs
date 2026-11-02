import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
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
 const count=await page.evaluate(async()=>{const {getContentLibrary}=await import('/src/lib/content.ts');const {useAppStore}=await import(window.__testStoreUrl);useAppStore.getState().setMainProgramId('liftosaur-phul');return getContentLibrary().programs.length})
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

 console.log('Checking cards and logging')
 const cardList=page.locator('.workout-exercise-cards')
 const rowList=page.locator('[data-workout-row-key]')
 await rowList.first().waitFor()
 assert.equal(await cardList.locator('.workout-table__title-button[aria-expanded=true]').count(),0)
 const firstKey=await rowList.first().getAttribute('data-workout-row-key')
 const secondKey=await rowList.nth(1).getAttribute('data-workout-row-key')
 const first=page.locator(`[data-workout-row-key="${firstKey}"]`)
 const second=page.locator(`[data-workout-row-key="${secondKey}"]`)
 assert.ok(await first.locator('.workout-card__up-next').isVisible())
 await first.getByRole('button',{name:/^Expand /}).click()
 const firstSet=first.locator('.workout-table__set-cell').first()
 await firstSet.getByRole('textbox',{name:/weight in kg/}).fill('40')
 await firstSet.getByRole('textbox',{name:/ reps$/}).fill('8')
 await second.getByRole('button',{name:/^Expand /}).click()
 assert.equal(await first.getByRole('button',{name:/^Expand /}).getAttribute('aria-expanded'),'false')
 assert.equal(await cardList.locator('.workout-table__title-button[aria-expanded=true]').count(),1)
 await first.getByRole('button',{name:/^Expand /}).click()
 assert.equal(await firstSet.getByRole('textbox',{name:/weight in kg/}).inputValue(),'40')
 await firstSet.getByRole('button',{name:/^Next /}).click()
 await page.waitForFunction(()=>document.querySelector('[data-workout-row-key] .workout-compact-commit')?.getAttribute('aria-pressed')==='true')
 assert.equal((await first.locator('.workout-card__count').textContent()).trim(),'1/3')
 assert.equal(await first.locator('.workout-card__progress .is-logged').count(),1)
 await firstSet.getByRole('textbox',{name:/ reps$/}).fill('9')
 // End the rest timer overlay to exercise pointer-driven reordering below it.
 const restClose=page.getByRole('button',{name:'Dismiss rest timer',exact:true})
 if(await restClose.count()) await restClose.first().click()
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000})
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
 }
 await page.setViewportSize({width:390,height:1000})
 console.log('Checking drag collapse and restoration')
 // Start dragging a collapsed card while the first exercise is expanded.
 const handle=second.locator('.workout-table__drag-handle')
 await handle.scrollIntoViewIfNeeded()
 const handleBox=await handle.boundingBox()
 await page.mouse.move(handleBox.x+handleBox.width/2,handleBox.y+handleBox.height/2)
 await page.mouse.down()
 await page.mouse.move(handleBox.x+handleBox.width/2,handleBox.y+handleBox.height/2-12,{steps:5})
 await page.waitForFunction(()=>document.querySelector('.workout-exercise-cards.is-reordering'))
 assert.equal(await cardList.locator('.workout-table__title-button[aria-expanded=true]').count(),0)
 assert.equal(await cardList.locator('td.workout-table__set-cell:not([hidden]):not(.workout-table__set-cell--empty)').count(),0)
 await first.scrollIntoViewIfNeeded()
 const targetBox=await first.boundingBox()
 await page.mouse.move(targetBox.x+25,targetBox.y+3,{steps:15})
 await page.mouse.up()
 await page.waitForFunction(()=>!document.querySelector('.workout-exercise-cards.is-reordering'))
 assert.equal(await first.getByRole('button',{name:/^Collapse /}).getAttribute('aria-expanded'),'true')
 assert.equal(await firstSet.getByRole('textbox',{name:/ reps$/}).inputValue(),'9')
 assert.equal(await rowList.first().getAttribute('data-workout-row-key'),secondKey)
 assert.ok(await second.locator('.workout-card__up-next').isVisible())
 assert.equal(await first.locator('.workout-card__up-next').count(),0)
 await first.getByRole('button',{name:/^Collapse /}).click()
 assert.equal(await cardList.locator('.workout-table__title-button[aria-expanded=true]').count(),0)
 // Skipping moves the next-up cue without automatically expanding a new card.
 await second.getByRole('button',{name:/^Expand /}).click()
 await second.locator('.workout-compact-actions-menu > summary').click()
 await second.getByRole('button',{name:/^Skip /}).click()
 assert.equal(await second.locator('.workout-card__up-next').count(),0)
 assert.ok(await first.locator('.workout-card__up-next').isVisible())
 assert.equal(await cardList.locator('.workout-table__title-button[aria-expanded=true]').count(),1)
 await page.reload({waitUntil:'domcontentloaded'})
 await page.locator('[data-workout-row-key]').first().waitFor()
 assert.equal(await cardList.locator('.workout-table__title-button[aria-expanded=true]').count(),0)
 assert.equal(await rowList.first().getAttribute('data-workout-row-key'),secondKey)
 await first.getByRole('button',{name:/^Expand /}).click()
 assert.equal(await firstSet.getByRole('textbox',{name:/ reps$/}).inputValue(),'9')
 assert.deepEqual(errors,[])
 console.log('Passed collapsed defaults, one-open accordion, progress, values across collapse/drag/reload, actual drag reorder and restoration, next-up after reorder/skip, and 320–1440px overflow checks.')
}catch(error){if(testPage){mkdirSync('.tmp/workout-cards',{recursive:true});console.log((await testPage.locator('body').innerText()).slice(-5000));await testPage.screenshot({path:'.tmp/workout-cards/failure.png',fullPage:true})}throw error}finally{await browser.close()}
