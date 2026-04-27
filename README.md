# Fitness Trainer

Mobile-first fitness tracker built with React, TypeScript, Vite, Zustand, Dexie, and a PWA shell.

## Open the app

Live app: [https://aurrix.github.io/fitness-trainer/](https://aurrix.github.io/fitness-trainer/)

Replace the link above with your real GitHub Pages URL if needed.

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

## Install the app

Words Memorizer works directly in the browser, but installing it makes it feel more like a native app.

### iPhone

Use **Safari**:

1. Open the live app.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Turn on **Open as Web App** if shown.
5. Tap **Add**.

### iPad

Use **Safari**:

1. Open the live app.
2. Tap **Share**.
3. Tap **More** if needed.
4. Tap **Add to Home Screen**.
5. Turn on **Open as Web App** if shown.
6. Tap **Add**.

### Android

Use **Chrome**:

1. Open the live app.
2. Tap the browser menu.
3. Tap **Add to Home screen**.
4. Tap **Install** if Chrome offers the install flow.
5. Follow the prompts.

If the site is offered only as a shortcut, you can still add it and launch it from your Home Screen.

### Windows

Use **Microsoft Edge** or **Chrome**:

- In **Edge**:
    1. Open the live app.
    2. If Edge offers install in the address bar, use it.
    3. Or open `...` -> **More tools** -> **Apps** -> **Install this site as an app**.

- In **Chrome**:
    1. Open the live app.
    2. If Chrome shows the install icon in the address bar, click it.
    3. Or open `...` -> **Cast, save, and share** -> **Install page as app**.

### macOS / Linux

Use **Chrome** or another Chromium-based browser with PWA install support:

1. Open the live app.
2. Use the install icon in the address bar if available.
3. If not, open the browser menu and choose the install option for the page/app.

## Browser support

The app is best used in modern browsers with support for:

- IndexedDB / local browser storage
- installable web apps / PWAs
- Web Speech API for microphone input and text-to-speech

Some features may vary by browser. If speech features are unavailable, the rest of the app still works normally.

## Data and privacy

- Your words are stored locally in your browser on the current device.
- Different browsers keep separate local storage.
- Clearing browser storage may remove your saved words and stats.

If you want to keep long-term study data, avoid clearing site data for the app.

## Troubleshooting

### I do not see the install option

- Refresh the page once after opening it
- Make sure you are using a supported browser
- Try Chrome, Edge, or Safari on the platforms above
- If install still does not appear, use the app in the browser

### I do not see microphone or speaker icons

- Your browser may not support the required speech APIs
- Your device or browser permissions may block microphone access
- Text input and study mode still work without speech features

## Official install help

If browser menus change over time, these official guides are the best fallback:

- Chrome on desktop: [Use web apps](https://support.google.com/chrome/answer/9658361?co=genie.platform%3DDesktop&hl=en)
- Chrome on Android: [Use web apps](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=en)
- Chrome shortcuts on Android: [Create shortcuts for websites in Chrome](https://support.google.com/chrome/answer/15085120?co=GENIE.Platform%3DAndroid&hl=en)
- Safari on iPhone: [Turn a website into an app in Safari on iPhone](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios)
- Safari on iPad: [Turn a website into an app in Safari on iPad](https://support.apple.com/en-tj/guide/ipad/ipad8f1f7a29/ipados)
- Microsoft Edge: [Install, manage, or uninstall apps in Microsoft Edge](https://support.microsoft.com/en-us/topic/install-manage-or-uninstall-apps-in-microsoft-edge-0c156575-a94a-45e4-a54f-3a84846f6113)
