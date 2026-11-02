# Free Exercise DB import

Source: https://github.com/yuhonas/free-exercise-db
Pinned upstream commit: f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5

Run `npm run import:exercises` or append `-- --dry-run`. The importer reads the checked-in snapshot, does not request the network, and writes flat exercise records plus the library index. `mapping.json` records each upstream ID's local destination. Review and edit these mappings before importing future snapshots; no fuzzy matching is used. Unique normalized names and aliases are merged; ambiguous matches remain distinct. Existing exercise IDs are never removed.

The source declares the Unlicense (see LICENSE.txt). Photographs are excluded because their origin and reuse rights are unverified: https://github.com/yuhonas/free-exercise-db/issues/2. Image references remain only in the unmodified source snapshot, not in the app's exercises.

Primary factor 1 and secondary factor 0.5 are application defaults, not measured muscle contributions. Abductors map to glute-med as an approximation. Existing detailed assignments and benchmarks take precedence. Missing upstream instructions remain empty; new exercises have no fabricated strength benchmarks. Cardio, stretching and named holds use the existing `continues` duration mode.

## Local additions

`pendulum-squat` is a separately maintained local exercise, not an upstream import or a hack-squat alias. Its original summary and instructions describe the supported, arcing machine squat. Equipment and muscle coverage reference: https://www.panattasport.com/en/freeweight-one/pendulum-squat/. Muscle factors use the same application defaults as imported entries; no machine-specific strength benchmarks are asserted. The importer retains local entries on subsequent runs.
