import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import * as reference from './reference/legacy/runtime.mjs'
import {definitions} from './reference/legacy/definitions.mjs'
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH??'/home/aurrix/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell'})
const errors=[],requests=[]
async function waitForApp(page,predicate){const deadline=Date.now()+60000;while(!await page.evaluate(predicate)){if(Date.now()>deadline)throw new Error('App state did not become ready');await page.waitForTimeout(100)}}
async function ready(page){
 page.setDefaultTimeout(45000);page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()))
 await page.goto('http://127.0.0.1:5176/workout',{waitUntil:'domcontentloaded',timeout:90000})
 await page.getByRole('heading',{name:'Fitness Trainer',exact:true}).waitFor()
 const source=await(await page.request.get('http://127.0.0.1:5176/src/App.tsx')).text()
 const storeUrl=source.match(/from ["']([^"']*\/src\/stores\/useAppStore\.ts[^"']*)["']/)?.[1]??'/src/stores/useAppStore.ts'
 const trainingUrl=source.match(/from ["']([^"']*\/src\/lib\/training\/store\.ts[^"']*)["']/)?.[1]??'/src/lib/training/store.ts'
 await page.evaluate(({storeUrl,trainingUrl})=>{window.__testStoreUrl=storeUrl;window.__testTrainingUrl=trainingUrl},{storeUrl,trainingUrl})
 const close=page.locator('.overlay').getByRole('button',{name:'Close',exact:true});try{await close.waitFor({timeout:3000});await close.click()}catch{}
 await waitForApp(page,async()=>{const {useAppStore}=await import(window.__testStoreUrl);const {useTrainingStore}=await import(window.__testTrainingUrl);return useAppStore.getState().isHydrated&&useTrainingStore.getState().ready})
}
async function start(page){await page.getByRole('button',{name:'Start this day',exact:true}).click();const confirm=page.getByRole('button',{name:'Start day',exact:true});if(await confirm.isVisible())await confirm.click();await waitForApp(page,async()=>{const {useAppStore}=await import(window.__testStoreUrl);return Boolean(useAppStore.getState().activeWorkout?.engine)})}
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});await ready(page)
 await page.evaluate(async()=>{const {useAppStore}=await import(window.__testStoreUrl);useAppStore.getState().setMainProgramId('liftosaur-gzcl-general-gainz')})
 assert.equal(await page.getByRole('button',{name:'Set starting targets for a new run',exact:true}).count(),0)
 await start(page)
 assert.equal(await page.getByRole('dialog',{name:/Set up/}).count(),0)
 const firstCard=page.locator('[data-workout-row-key]').first()
 await firstCard.getByRole('button',{name:/^Expand /}).click()
 await firstCard.getByText('Learning your starting point',{exact:true}).waitFor()
 assert.equal(await firstCard.locator('.workout-progression-coach').isVisible(),true)
 await page.screenshot({path:'.tmp/progression-concepts/coach-learning-ui.png',fullPage:true})
 await firstCard.getByRole('button',{name:/^Collapse /}).click()
 await page.evaluate(async()=>{
  const {useAppStore}=await import(window.__testStoreUrl);const store=useAppStore.getState(),workout=store.activeWorkout,first=workout.engine.section.exercises[0],now=new Date().toISOString(),log=workout.exerciseLogs[first.id]
  store.setActiveWorkout({...workout,updatedAt:now,exerciseLogs:{...workout.exerciseLogs,[first.id]:{...log,setLogs:log.setLogs.map((set,i)=>i===0?{...set,reps:'5',weightKg:'70',effort:'8',completedAt:now,loggedAt:now}:set)}}})
 })
 await waitForApp(page,async()=>{const {useAppStore}=await import(window.__testStoreUrl);return useAppStore.getState().activeWorkout.engine.section.exercises[0].prescriptions.length===6})
 const row=page.locator('[data-workout-row-key]').first();await row.getByRole('button',{name:/^Expand /}).click()
 await row.getByText('5 follow-up sets ready',{exact:true}).waitFor()
 assert.match(await row.locator('.workout-progression-coach').innerText(),/Next: 5 × 1 rep at 70 kg/)
 await row.getByText('Why this changed',{exact:true}).click()
 assert.match(await row.locator('.workout-progression-coach details').innerText(),/Completed sets keep their original targets/)
 await page.screenshot({path:'.tmp/progression-concepts/coach-adapted-ui.png',fullPage:true})
 await row.getByText('Why this changed',{exact:true}).click()
 await row.getByRole('button',{name:/^Collapse /}).click()
 assert.equal(await row.locator('.workout-progression-coach').isVisible(),false)
 await row.getByRole('button',{name:/^Expand /}).click()
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false)
 assert.equal((await row.locator('.training-target strong').allTextContents()).filter(t=>t.startsWith('Target')).length,6)
 await page.reload({waitUntil:'domcontentloaded'});await ready(page)
 const active=await page.evaluate(async()=>{const {useAppStore}=await import(window.__testStoreUrl);return useAppStore.getState().activeWorkout})
 assert.equal(active.engine.initialSection.exercises[0].prescriptions.length,1)
 assert.equal(active.engine.baselines[active.engine.section.exercises[0].exerciseId].weightKg,70);assert.equal(active.engine.baselines[active.engine.section.exercises[0].exerciseId].reps,5);assert.equal(active.engine.section.exercises[0].prescriptions.length,6);assert.equal(active.engine.before.version,2)
 console.log('Passed native adaptive sets in the workout UI, automatic load inference, and reload/resume.')
 const id='liftosaur-gzclp',legacy=definitions[id]
 const state=reference.initialize({definition:legacy,id,name:id,values:Object.fromEntries(reference.inspect({definition:legacy,id,name:id}).map(f=>[f.key,{weightKg:f.bodyweight?0:40,maximumKg:100,incrementKg:f.increment}]))})
 const old=reference.prepare({definition:legacy,state,sectionId:legacy.sections[0].id}),logs=Object.fromEntries(old.section.exercises.map(ex=>[ex.id,{setLogs:ex.prescriptions.map(p=>({reps:'0',weightKg:String(p.weightKg??0),duration:String((p.durationSeconds??30)/60),effort:'8',completedAt:'2026-11-02T12:00:00Z'}))}]))
 const oldState=reference.finish({session:old,logs,effortScale:'rpe'}).state
 const migration=await browser.newPage({viewport:{width:390,height:844}});await ready(migration)
 await migration.evaluate(async({id,state,revision})=>{const {useAppStore}=await import(window.__testStoreUrl);const {useTrainingStore}=await import(window.__testTrainingUrl);useTrainingStore.getState().setRun(id,{state,revision,explanations:[]});useAppStore.getState().setMainProgramId(id)},{id,state:oldState,revision:legacy.revision})
 await start(migration)
 const result=await migration.evaluate(async()=>{const {useAppStore}=await import(window.__testStoreUrl);const {useTrainingStore}=await import(window.__testTrainingUrl);return {workout:useAppStore.getState().activeWorkout,run:useTrainingStore.getState().runs['liftosaur-gzclp']}})
 assert.equal(result.workout.engine.before.version,2);assert.equal(result.workout.engine.before.runId,oldState.runId)
 assert.equal(result.workout.engine.section.exercises[0].prescriptions.length,6)
 assert.equal(result.run.revision,result.workout.engine.definition.revision)
 assert.ok(result.run.state.importedStateBackup)
 const editor=await browser.newPage({viewport:{width:390,height:844}});await ready(editor)
 const editorModules=await editor.evaluate(()=>({storeUrl:window.__testStoreUrl,trainingUrl:window.__testTrainingUrl}))
 await editor.goto('http://127.0.0.1:5176/library/programs',{waitUntil:'domcontentloaded'})
 await editor.evaluate(({storeUrl,trainingUrl})=>{window.__testStoreUrl=storeUrl;window.__testTrainingUrl=trainingUrl},editorModules)
 const original=JSON.parse(fs.readFileSync('src/assets/programms/liftosaur-gzcl-general-gainz.json'))
 await editor.getByRole('searchbox').fill(original.displayLabel)
 const card=editor.locator('.program-card').filter({has:editor.getByRole('heading',{name:original.displayLabel,exact:true})})
 await card.getByRole('button',{name:'Open',exact:true}).click()
 const program=editor.getByRole('dialog',{name:original.displayLabel,exact:true})
 await program.locator('summary[aria-label="More program actions"]').click()
 await program.getByRole('button',{name:'Clone',exact:true}).click()
 const input=editor.getByLabel('Program definition',{exact:true});await input.waitFor()
 assert.equal(await input.getAttribute('readonly'),null)
 const edited=JSON.parse(await input.inputValue())
 edited.sections[0].exercises[0].advanced.stages[0][0].restSeconds=150
 edited.sections[0].exercises[0].prescriptions[0].restSeconds=150
 await input.fill(JSON.stringify(edited))
 await editor.getByRole('button',{name:'Save Program',exact:true}).click()
 await waitForApp(editor,async()=>{const {useAppStore}=await import(window.__testStoreUrl);return useAppStore.getState().customPrograms.length===1})
 const saved=await editor.evaluate(async()=>{const {useAppStore}=await import(window.__testStoreUrl);const {trainingEngine}=await import('/src/lib/training/client.ts');const program=useAppStore.getState().customPrograms[0],definition=program.engine;const state=await trainingEngine('initialize',{definition});const session=await trainingEngine('prepare',{definition,state,sectionId:definition.sections[0].id});return {rules:Object.keys(definition.rulePrograms).length,compatibility:definition.compatibility,rest:session.section.exercises[0].prescriptions[0].restSeconds}})
 assert.ok(saved.rules>0);assert.equal(saved.compatibility,undefined);assert.equal(saved.rest,150)
 console.log('Passed advanced-program cloning, JSON editing, validation, persistence, and native execution of the edited target.')
 assert.ok(!requests.some(url=>/\/engine\/(?:liftosaur|compatibility)/.test(url)))
 assert.deepEqual(errors,[])
 console.log('Passed saved-run upgrade in the real worker/UI with preserved run ID, stage and backup; no interpreter requests.')
}finally{await browser.close()}
