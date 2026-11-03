import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as R from '../public/engine/runtime.mjs';
const catalog = fs.readdirSync('src/assets/programms').filter(f => f.endsWith('.json') && f !== 'index.json').map(f => JSON.parse(fs.readFileSync('src/assets/programms/' + f)));
const setup = async (p) => { const fields = (await R.inspect({ definition: p.engine, id: p.id, name: p.displayLabel })); return (await R.initialize({ definition: p.engine, id: p.id, name: p.displayLabel, values: Object.fromEntries(fields.map(f => [f.key, { weightKg: f.bodyweight ? 0 : 40, incrementKg: f.increment, maximumKg: 100 }])) })); };
const results = s => Object.fromEntries(s.section.exercises.map((ex, i) => [ex.id, { setLogs: s.record.entries[i].sets.map(set => ({ reps: String(set.reps ?? 1), duration: String((set.setTimer ?? 30) / 60), weightKg: String(set.weight?.value ?? 0), completedAt: '2026-11-02T12:00:00Z', effort: '8' })) }]));
test('all 75 programs compile, resolve mappings, seed, prepare and finish', async () => {
    assert.equal(catalog.length, 75);
    for (const p of catalog) {
        try {
            const state = (await setup(p));
            const session = (await R.prepare({ definition: p.engine, state, sectionId: p.engine.sections[0].id }));
            assert.ok(session.section.exercises.length);
            for (const ex of session.section.exercises)
                assert.ok(fs.existsSync(`src/assets/exercises/${ex.exerciseId}.json`));
            session.answers = Object.fromEntries((session.prompts ?? []).map(p => [p.id, 0]));
            const finished = (await R.finish({ session, logs: results(session), effortScale: 'rpe' }));
            assert.ok(finished.state.program);
        }
        catch (error) {
            throw new Error(`${p.id}: ${error.stack}`);
        }
    }
});
test('double progression changes future targets without changing the session snapshot', async () => {
    const p = catalog.find(p => p.id === 'phul'), session = (await R.prepare({ definition: p.engine, state: (await setup(p)), sectionId: 'engine-day-1' }));
    const original = JSON.stringify(session), a = (await R.finish({ session, logs: results(session), effortScale: 'rpe' })), b = (await R.finish({ session, logs: results(session), effortScale: 'rpe' }));
    assert.equal(JSON.stringify(session), original);
    assert.deepEqual(a.state, b.state);
    assert.ok(a.explanations[0].includes('4 reps'));
});
test('native ranges expand and optional core is retained', async () => {
    assert.equal(catalog.find(p => p.id === 'upper-lower-intermediate').engine.sections.length, 32);
    const ppl = catalog.find(p => p.id === 'ppl-v2-intermediate').engine.sections;
    assert.equal(ppl.filter(s => !s.optional).length, 60);
    assert.equal(ppl.filter(s => s.optional).length, 10);
    assert.equal(catalog.find(p => p.id === 'basic-beginner').engine.sections.length, 6);
});
test('native progression increases load at the range ceiling and deloads after three failures', async () => {
    const p = catalog.find(p => p.id === 'upper-lower-intermediate');
    let state = (await setup(p)), session = (await R.prepare({ definition: p.engine, state, sectionId: 'engine-day-1' })), logs = results(session);
    logs[session.section.exercises[0].id].setLogs.forEach(s => { s.reps = '8'; s.effort = '7'; });
    const success = (await R.finish({ session, logs, effortScale: 'rpe' }));
    const next = (await R.prepare({ definition: p.engine, state: success.state, sectionId: 'engine-day-1' }));
    assert.ok(next.section.exercises[0].prescriptions[0].weightKg > 40);
    state = (await setup(p));
    for (let i = 0; i < 3; i++) {
        session = (await R.prepare({ definition: p.engine, state, sectionId: 'engine-day-1' }));
        logs = results(session);
        logs[session.section.exercises[0].id].setLogs.forEach(s => { s.reps = '1'; s.effort = '10'; });
        state = (await R.finish({ session, logs, effortScale: 'rpe' })).state;
    }
    assert.ok((await R.prepare({ definition: p.engine, state, sectionId: 'engine-day-1' })).section.exercises[0].prescriptions[0].weightKg < 40);
});
test('percentage loads keep their explicit basis and skipped exercises do not progress', async () => {
    const p = catalog.find(p => p.id === 'nsuns'), state = (await setup(p)), session = (await R.prepare({ definition: p.engine, state, sectionId: 'engine-day-1' }));
    assert.equal(session.section.exercises[0].prescriptions[0].formula, '58% of 1RM');
    const logs = results(session);
    for (const log of Object.values(logs))
        log.skipped = true;
    const next = (await R.finish({ session, logs, effortScale: 'rpe' }));
    assert.equal((await R.prepare({ definition: p.engine, state: next.state, sectionId: 'engine-day-1' })).section.exercises[0].prescriptions[0].weightKg, session.section.exercises[0].prescriptions[0].weightKg);
});
test('supersets and timed variations survive preparation', async () => {
    const p = catalog.find(p => p.id === 'recommended-routine'), session = (await R.prepare({ definition: p.engine, state: (await setup(p)), sectionId: 'engine-day-1' }));
    assert.ok(session.section.exercises.some(e => e.superset));
    assert.ok(session.section.exercises.some(e => e.prescriptions.some(s => s.durationSeconds > 0)));
    assert.ok(session.section.exercises.every(e => e.prescriptions.every(s => s.kind === 'work')));
});
test('within-range reps are successful holds and fixed-rep failures deload', async () => {
    const p = catalog.find(p => p.id === 'upper-lower-intermediate');
    let state = (await setup(p));
    for (let i = 0; i < 3; i++) {
        const session = (await R.prepare({ definition: p.engine, state, sectionId: 'engine-day-1' })), logs = results(session);
        logs[session.section.exercises[0].id].setLogs.forEach(s => { s.reps = '6'; s.effort = '7'; });
        state = (await R.finish({ session, logs, effortScale: 'rpe' })).state;
    }
    assert.equal((await R.prepare({ definition: p.engine, state, sectionId: 'engine-day-1' })).section.exercises[0].prescriptions[0].weightKg, 40);
    const program = { name: 'Custom test', sections: [{ weekIndex: 1, dayIndex: 1, name: 'Day 1', exercises: [{ exerciseName: 'Bench', sets: '3', reps: '5', duration: '', rest: '2 min', notes: '' }] }] };
    const def = (await R.adapt({ program, exercises: [{ id: 'bench', name: 'Bench', aliases: [], strengthBenchmarks: { measurement: { basis: 'barbell' } } }], revision: 'test' }));
    const manual = { id: 'custom', displayLabel: 'Custom', engine: def };
    state = (await setup(manual));
    for (let i = 0; i < 3; i++) {
        const session = (await R.prepare({ definition: def, state, sectionId: 'engine-day-1' })), logs = results(session);
        Object.values(logs).forEach(e => e.setLogs.forEach(s => { s.reps = '1'; }));
        state = (await R.finish({ session, logs, effortScale: 'rpe' })).state;
    }
    assert.ok((await R.prepare({ definition: def, state, sectionId: 'engine-day-1' })).section.exercises[0].prescriptions[0].weightKg < 40);
});
test('edited outcomes replay deterministically without mutating stored targets', async () => {
    const p = catalog.find(p => p.id === 'phul'), seed = (await setup(p));
    const first = (await R.prepare({ definition: p.engine, state: seed, sectionId: 'engine-day-1' })), firstLogs = results(first);
    const original = JSON.stringify(first);
    const one = (await R.finish({ session: first, logs: firstLogs, effortScale: 'rpe' }));
    const second = (await R.prepare({ definition: p.engine, state: one.state, sectionId: 'engine-day-1' })), secondLogs = results(second);
    const two = (await R.finish({ session: second, logs: secondLogs, effortScale: 'rpe' }));
    Object.values(firstLogs).forEach(log => log.setLogs.forEach(set => { set.reps = '1'; }));
    const revisedOne = (await R.finish({ session: first, logs: firstLogs, effortScale: 'rpe' }));
    const replay = (await R.prepare({ definition: p.engine, state: revisedOne.state, sectionId: second.section.id }));
    const revisedTwo = (await R.finish({ session: replay, logs: secondLogs, effortScale: 'rpe' }));
    assert.equal(JSON.stringify(first), original);
    assert.equal(revisedTwo.state.runId, seed.runId);
    assert.ok(two.state.program);
    assert.deepEqual((await R.finish({ session: replay, logs: secondLogs, effortScale: 'rpe' })).state, revisedTwo.state);
});
test('automatic setup learns each exercise from completed sets and leaves skipped exercises unseeded', async () => {
    const p = catalog.find(p => p.id === 'upper-lower-intermediate');
    const state = (await R.initialize({ definition: p.engine, id: p.id, name: p.displayLabel }));
    const session = (await R.prepare({ definition: p.engine, state, sectionId: 'engine-day-1' }));
    assert.equal(session.section.exercises[0].prescriptions[0].weightKg, null);
    const logs = results(session);
    Object.values(logs).forEach(log => { log.skipped = true; });
    const first = logs[session.section.exercises[0].id];
    first.skipped = false;
    first.setLogs.forEach(set => { set.weightKg = '60'; set.reps = '6'; });
    const updated = (await R.update({ session, logs, effortScale: 'rpe' }));
    assert.equal(updated.section.exercises[0].prescriptions[0].weightKg, 60);
    assert.equal(updated.section.exercises[1].prescriptions[0].weightKg, null);
    const finished = (await R.finish({ session: updated, logs, effortScale: 'rpe' }));
    const next = (await R.prepare({ definition: p.engine, state: finished.state, sectionId: 'engine-day-1' }));
    assert.equal(next.section.exercises[0].prescriptions[0].weightKg, 60);
    assert.equal(next.section.exercises[1].prescriptions[0].weightKg, null);
    assert.equal(session.section.exercises[0].prescriptions[0].weightKg, null);
});

test('saved version 1 snapshots migrate to native execution without changing stored data', async()=>{
 const {definitions}=await import('./reference/legacy/definitions.mjs')
 const old=await import('./reference/legacy/runtime.mjs')
 const definition=definitions['phul'],migrationDefinition=catalog.find(p=>p.id==='phul').engine
 const fields=old.inspect({definition,id:'legacy',name:'Legacy PHUL'})
 const state=old.initialize({definition,id:'legacy',name:'Legacy PHUL',values:Object.fromEntries(fields.map(f=>[f.key,{weightKg:f.bodyweight?0:40,maximumKg:100,incrementKg:f.increment}]))})
 const session=old.prepare({definition,state,sectionId:definition.sections[0].id}),before=JSON.stringify(session)
 const first=await R.finish({session,migrationDefinition,logs:results(session),effortScale:'rpe'})
 const replay=await R.finish({session,migrationDefinition,logs:results(session),effortScale:'rpe'})
 assert.equal(first.definition.version,2)
 assert.equal(first.state.version,2)
 assert.equal(first.state.runId,state.runId)
 assert.equal(JSON.stringify(session),before)
 assert.deepEqual(first.state,replay.state)
})
