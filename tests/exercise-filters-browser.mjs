import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
mkdirSync('.tmp/exercise-filters', { recursive: true })
writeFileSync('.tmp/exercise-filters/picker.html', `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div><script type="module">import React from 'react';import{createRoot}from'react-dom/client';import Picker from '/src/components/WorkoutExercisePickerSheet.tsx';import{getContentLibrary}from'/src/lib/content.ts';import'/src/index.css';import'/src/App.css';createRoot(document.getElementById('root')).render(React.createElement(Picker,{exercises:getContentLibrary().exercises,actionLabel:'Substitute',preferredReferences:['barbell-bench-press'],onClose:()=>{},onSelectExercise:()=>{}}));</script>`)
const browser = await chromium.launch({headless:true,executablePath:'/home/aurrix/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell'})
try {
 const page = await browser.newPage({viewport:{width:390,height:844}})
 page.setDefaultTimeout(60000)
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 const url=process.env.APP_URL??'http://localhost:5173'
 for(const picker of [false,true]) {
  await page.goto(`${url}/${picker?'.tmp/exercise-filters/picker.html':'library/exercises'}`)
  if(!picker){const close=page.locator('.overlay').getByRole('button',{name:'Close',exact:true});try{await close.click({timeout:4000})}catch{}}
  else await page.getByRole('button',{name:'All exercises',exact:true}).click()
  const triggers=page.locator('.exercise-facets__triggers button')
  await triggers.first().click()
  const sheet=page.locator('.exercise-filter-dialog')
  await sheet.getByRole('button',{name:'Abs',exact:true}).click()
  await sheet.getByRole('button',{name:'Bodyweight',exact:true}).click()
  assert.match(await triggers.first().innerText(),/Any muscle/)
  const show=sheet.getByRole('button',{name:/Show \d+ exercises?/})
  assert.ok(Number((await show.innerText()).match(/\d+/)[0])>0)
  await show.click()
  assert.match(await triggers.first().innerText(),/Abs/)
  assert.match(await triggers.nth(1).innerText(),/Bodyweight/)
  await triggers.nth(1).click()
  await sheet.getByRole('button',{name:'Barbell',exact:true}).click()
  await page.keyboard.press('Escape')
  await sheet.waitFor({state:'detached'})
  assert.match(await triggers.nth(1).innerText(),/Bodyweight/)
  assert.equal(await triggers.nth(1).evaluate(e=>e===document.activeElement),true)
  if(picker) assert.equal(await page.locator('.exercise-sheet').count(),1)
  await triggers.first().click()
  for(const width of [320,390,768,1440]) {
   await page.setViewportSize({width,height:844})
   assert.ok(await sheet.evaluate(e=>e.scrollWidth<=e.clientWidth+1))
   const box=await sheet.getByRole('button',{name:/Show \d+ exercises?/}).boundingBox()
   assert.ok(box.y+box.height<=844)
  }
  await page.setViewportSize({width:390,height:844})
  await page.screenshot({path:`.tmp/exercise-filters/${picker?'replacement':'library'}-sheet.png`})
  await sheet.getByRole('button',{name:'Reset all',exact:true}).click()
  await sheet.getByRole('button',{name:/Show \d+ exercises?/}).click()
  assert.match(await triggers.first().innerText(),/Any muscle/)
  if(picker){const candidate=page.locator('.exercise-picker-candidate__preview').first();await candidate.click();await page.getByRole('tab',{name:'Overview',exact:true}).waitFor();await page.getByRole('button',{name:'Back to replacements',exact:true}).click();await triggers.first().waitFor()}
 }
 assert.deepEqual(errors,[])
 console.log('Passed library and replacement filters, draft/apply/reset/cancel, nested Escape, focus restoration, preview return, and responsive sheet checks.')
} finally { await browser.close() }
