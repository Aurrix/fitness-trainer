# Fitness Trainer

Mobile-first fitness tracker built with React, TypeScript, Vite, Zustand, Dexie, and a PWA shell.

## Development

```bash
npm install
npm run dev
```

Useful commands:

- `npm run lint`
- `npm run build`
- `npm run enrich:exercises`
- `npm run sync:content`

## Data Persistence

The app stores user data locally on the device in IndexedDB through Dexie.

- Database name: `fitness-trainer-db`
- Table: `appState`
- Persistence model: key/value records with `updatedAt`
- Migration behavior: if a key does not exist in IndexedDB yet, the app attempts to read the legacy `localStorage` value once and writes it into IndexedDB

Current persisted keys:

- `fitness-trainer.fitness-profile`
  User profile fields such as gender, age, height, weight, body-fat percentage, activity level, goal, effort scale, and weekly workout target.
- `fitness-trainer.active-workout`
  The in-progress workout session, including selected day, exercise order, per-exercise status, notes, and per-set logging.
- `fitness-trainer.workout-logs`
  Finished workout sessions stored as workout history.
- `fitness-trainer.program-day-logs`
  Finished program day snapshots with timestamps, per-exercise summaries, and per-muscle aggregates.
- `fitness-trainer.exercise-stats`
  Exercise-specific progression history used by the exercise detail view.
- `fitness-trainer.body-composition-entries`
  Body stats snapshots, including weight, body-fat percentage, and body measurements.
- `fitness-trainer.custom-programs`
  User-created programs stored on-device.
- `fitness-trainer.saved-program-ids`
  Library programs starred/saved by the user.
- `fitness-trainer.main-program-id`
  The currently selected main program.
- `fitness-trainer.program-stats`
  Aggregated program-level interaction stats such as starts, completions, minutes, and recent events.

## When Data Is Written

- Profile changes are persisted immediately.
- Body stats entries are saved when the body form is submitted.
- Active workout state is persisted on every meaningful change:
  set input changes, added sets, completion/skip toggles, added exercises, removals, reorder operations, and notes.
- Exercise stats and program day logs are generated when a workout day is finished.
- Program history and program aggregate stats are appended/updated when a workout day is started, replaced, discarded, or completed.

## Calculations

### General

- BMI:
  `weightKg / (heightMeters * heightMeters)`
- Lean mass:
  `weightKg * (1 - bodyFatPercentage / 100)`
- Session date key:
  local calendar day extracted from the workout timestamp and stored as `YYYY-MM-DD`

### Workout Logging

- A set is considered logged if any of these fields has a value:
  `duration`, `weightKg`, `reps`, or `effort`
- Per-exercise performed set count:
  number of sets with any logged content
- Total reps:
  sum of numeric `reps` across logged sets
- Total duration:
  sum of numeric `duration` across logged sets
- Max weight:
  maximum numeric `weightKg` across logged sets
- Total volume:
  `sum(weightKg * reps)` when both exist for a set
  If reps are missing but weight exists, the set contributes `weightKg`

### Program Progression

- Day completion ratio:
  `completedExerciseCount / totalExerciseCount * 100`
- Strength score:
  for each exercise, take the best estimated 1RM from its logged sets and sum those best values across the day
- Estimated 1RM formula:
  `weightKg * (1 + reps / 30)`
- Weekly consistency:
  sessions grouped by week, with Monday used as the week start
- Muscle target coefficient:
  each exercise distributes `1 / muscleGroupCount` to each mapped muscle group
- Program day muscle totals:
  sum of target coefficients, sets, reps, duration, and volume from all exercises that hit the muscle

### Body Composition

- Weight delta:
  latest saved weight minus earliest saved weight
- Body fat delta:
  latest saved body-fat percentage minus earliest saved body-fat percentage
- Waist delta:
  latest saved waist measurement minus earliest saved waist measurement
- Measurement comparison chart:
  compares earliest saved values vs latest saved values for tracked body areas

## Where Stats Are Shown

- `Stats > Program`
  Program-level charts for strength trend, completion, duration, and weekly consistency.
- `Stats > Body`
  Weight, body-fat, lean-mass, and body-measurement charts.
- Exercise detail view
  Exercise-specific progression charts such as max weight, volume, reps, duration, and latest logged effort.

## Notes

- All data is currently device-local. There is no backend sync yet.
- Exercise-specific stats are intentionally shown in the exercise detail sheet instead of the main stats screen.
- Chart views currently focus on recent history windows to stay compact on mobile.
