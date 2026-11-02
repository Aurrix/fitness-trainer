import { test } from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
const { outputFiles } = await build({entryPoints:['src/lib/exercise-filters.ts'],bundle:true,write:false,platform:'node',format:'esm'})
const {matchesExerciseFacets:matches,emptyExerciseFacets:empty,muscleGroups}=await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`)
test('broad groups match fine-grained supporting targets and combine with equipment',()=>{
 const exercise={muscleGroups:['upper-chest','triceps-long-head'],equipment:['dumbbell']}
 assert.equal(matches(exercise,{...empty,muscle:'arms',equipment:'dumbbells'}),true)
 assert.equal(matches(exercise,{...empty,muscle:'chest',equipment:'barbell'}),false)
 assert.equal(matches(exercise,{...empty,specificMuscle:'lower-chest'}),false)
})
test('equipment groups normalize aliases without substring matches; exact uncommon choices survive',()=>{
 assert.equal(matches({muscleGroups:[],equipment:['leverageMachine']},{...empty,equipment:'machine'}),true)
 assert.equal(matches({muscleGroups:[],equipment:['dumbbell']},{...empty,equipment:'barbell'}),false)
 assert.equal(matches({muscleGroups:[],equipment:['trap bar']},{...empty,equipment:'exact:trap bar'}),true)
 assert.equal(matches({muscleGroups:[],equipment:[]},{...empty,equipment:'bodyweight'}),false)
})
test('broad groups cover the entire muscle taxonomy',async()=>{
 const {outputFiles}=await build({entryPoints:['src/entities/exercise-muscles.ts'],bundle:true,write:false,platform:'node',format:'esm'})
 const {ExerciseMuscleGroup}=await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`)
 const mapped=new Set(muscleGroups.flatMap(group=>group[2].split(' ')))
 for(const muscle of Object.values(ExerciseMuscleGroup))assert.ok(mapped.has(muscle),muscle)
})
