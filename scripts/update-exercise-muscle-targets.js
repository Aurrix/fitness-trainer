import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const selectedLetters = expandLetterArgs(args.length ? args : ['a-j'])
const exercisesDir = path.join(process.cwd(), 'src', 'assets', 'exercises')

const FLAT_PRESS_PRIMARY = [['middle-chest', 1]]
const FLAT_PRESS_SECONDARY = [
  ['upper-chest', 0.6],
  ['lower-chest', 0.5],
  ['inner-chest', 0.6],
  ['front-delts', 0.6],
  ['triceps-lateral-head', 0.6],
  ['triceps-medial-head', 0.5],
]
const INCLINE_PRESS_PRIMARY = [['upper-chest', 1]]
const INCLINE_PRESS_SECONDARY = [
  ['middle-chest', 0.7],
  ['inner-chest', 0.5],
  ['front-delts', 0.7],
  ['triceps-lateral-head', 0.6],
  ['triceps-medial-head', 0.5],
]
const DECLINE_PRESS_PRIMARY = [['lower-chest', 1]]
const DECLINE_PRESS_SECONDARY = [
  ['middle-chest', 0.7],
  ['inner-chest', 0.5],
  ['front-delts', 0.5],
  ['triceps-lateral-head', 0.6],
  ['triceps-medial-head', 0.5],
]
const DIP_PRESS_PRIMARY = [['lower-chest', 1]]
const DIP_PRESS_SECONDARY = [
  ['middle-chest', 0.7],
  ['inner-chest', 0.5],
  ['triceps-lateral-head', 0.7],
  ['triceps-medial-head', 0.6],
  ['triceps-long-head', 0.5],
  ['front-delts', 0.4],
]
const FLAT_FLY_PRIMARY = [
  ['middle-chest', 1],
  ['inner-chest', 0.8],
]
const FLAT_FLY_SECONDARY = [
  ['upper-chest', 0.3],
  ['lower-chest', 0.3],
  ['front-delts', 0.2],
]
const INCLINE_FLY_PRIMARY = [
  ['upper-chest', 1],
  ['inner-chest', 0.8],
]
const INCLINE_FLY_SECONDARY = [
  ['middle-chest', 0.4],
  ['front-delts', 0.2],
]
const ROW_PRIMARY = [
  ['lats', 1],
  ['rhomboids', 0.9],
  ['mid-traps', 0.8],
]
const ROW_SECONDARY = [
  ['rear-delts', 0.6],
  ['teres-major', 0.6],
  ['biceps-short-head', 0.5],
  ['brachialis', 0.5],
]
const REVERSE_FLY_PRIMARY = [['rear-delts', 1]]
const REVERSE_FLY_SECONDARY = [
  ['rhomboids', 0.6],
  ['mid-traps', 0.5],
  ['infraspinatus', 0.5],
]
const FACE_PULL_PRIMARY = [
  ['rear-delts', 1],
  ['lower-traps', 0.8],
]
const FACE_PULL_SECONDARY = [
  ['mid-traps', 0.6],
  ['rhomboids', 0.6],
  ['infraspinatus', 0.7],
]
const SHOULDER_PRESS_PRIMARY = [
  ['front-delts', 1],
  ['side-delts', 0.8],
]
const SHOULDER_PRESS_SECONDARY = [
  ['triceps-long-head', 0.6],
  ['triceps-lateral-head', 0.5],
  ['triceps-medial-head', 0.4],
  ['upper-chest', 0.3],
]
const ADDUCTOR_PRIMARY = [
  ['adductor-magnus', 1],
  ['adductor-longus', 0.9],
]
const ADDUCTOR_SECONDARY = [['pectineus', 0.6]]
const SQUAT_PRIMARY = [
  ['rectus-femoris', 1],
  ['vastus-lateralis', 1],
  ['glute-max', 0.9],
]
const SQUAT_SECONDARY = [
  ['vastus-medialis', 0.8],
  ['vastus-intermedius', 0.7],
  ['glute-med', 0.6],
  ['adductor-magnus', 0.5],
  ['spinal-erectors', 0.5],
]
const FRONT_SQUAT_PRIMARY = [
  ['rectus-femoris', 1],
  ['vastus-lateralis', 1],
  ['vastus-medialis', 0.9],
]
const FRONT_SQUAT_SECONDARY = [
  ['vastus-intermedius', 0.8],
  ['glute-max', 0.6],
  ['adductor-magnus', 0.5],
  ['spinal-erectors', 0.5],
]
const SPLIT_SQUAT_PRIMARY = [
  ['rectus-femoris', 1],
  ['glute-max', 0.9],
  ['vastus-lateralis', 0.9],
]
const SPLIT_SQUAT_SECONDARY = [
  ['vastus-medialis', 0.8],
  ['vastus-intermedius', 0.7],
  ['glute-med', 0.6],
  ['adductor-magnus', 0.5],
]
const HACK_SQUAT_PRIMARY = [
  ['vastus-lateralis', 1],
  ['rectus-femoris', 0.9],
  ['vastus-medialis', 0.9],
  ['vastus-intermedius', 0.8],
]
const HACK_SQUAT_SECONDARY = [
  ['glute-max', 0.4],
  ['adductor-magnus', 0.4],
]
const HINGE_BACK_EXTENSION_PRIMARY = [
  ['spinal-erectors', 1],
  ['glute-max', 0.8],
]
const HINGE_BACK_EXTENSION_SECONDARY = [
  ['biceps-femoris', 0.6],
  ['semitendinosus', 0.5],
  ['semimembranosus', 0.5],
]
const DEADLIFT_PRIMARY = [
  ['spinal-erectors', 1],
  ['glute-max', 0.9],
  ['biceps-femoris', 0.8],
]
const DEADLIFT_SECONDARY = [
  ['semitendinosus', 0.7],
  ['semimembranosus', 0.7],
  ['adductor-magnus', 0.5],
  ['upper-traps', 0.5],
  ['forearm-flexors', 0.5],
  ['vastus-lateralis', 0.4],
]
const HIP_THRUST_PRIMARY = [
  ['glute-max', 1],
  ['glute-med', 0.8],
]
const HIP_THRUST_SECONDARY = [
  ['glute-min', 0.6],
  ['biceps-femoris', 0.4],
  ['spinal-erectors', 0.3],
]
const HIP_THRUST_HINGE_PRIMARY = [
  ['glute-max', 1],
  ['biceps-femoris', 0.8],
  ['semitendinosus', 0.8],
]
const HIP_THRUST_HINGE_SECONDARY = [
  ['semimembranosus', 0.7],
  ['spinal-erectors', 0.6],
  ['glute-med', 0.5],
]
const PULL_THROUGH_PRIMARY = [
  ['glute-max', 1],
  ['glute-med', 0.7],
]
const PULL_THROUGH_SECONDARY = [
  ['biceps-femoris', 0.6],
  ['semitendinosus', 0.5],
  ['semimembranosus', 0.5],
  ['spinal-erectors', 0.4],
]
const CURL_CONCENTRATION_PRIMARY = [
  ['biceps-short-head', 1],
  ['brachialis', 0.8],
]
const CURL_CONCENTRATION_SECONDARY = [
  ['biceps-long-head', 0.4],
  ['brachioradialis', 0.4],
]
const CURL_INCLINE_PRIMARY = [
  ['biceps-long-head', 1],
  ['brachialis', 0.7],
]
const CURL_INCLINE_SECONDARY = [
  ['biceps-short-head', 0.4],
  ['brachioradialis', 0.4],
]
const KICKBACK_PRIMARY = [
  ['triceps-long-head', 0.9],
  ['triceps-lateral-head', 0.8],
]
const KICKBACK_SECONDARY = [['triceps-medial-head', 0.6]]
const LEG_RAISE_PRIMARY = [
  ['lower-abs', 1],
  ['hip-flexors', 0.9],
]
const LEG_RAISE_SECONDARY = [
  ['upper-abs', 0.6],
  ['obliques', 0.4],
  ['transverse-abdominis', 0.3],
]
const ROLLOUT_PRIMARY = [
  ['transverse-abdominis', 1],
  ['upper-abs', 0.8],
]
const ROLLOUT_SECONDARY = [
  ['obliques', 0.6],
  ['lower-abs', 0.5],
  ['serratus-anterior', 0.4],
]
const PULLOVER_PRIMARY = [
  ['lats', 1],
  ['teres-major', 0.8],
]
const PULLOVER_SECONDARY = [
  ['serratus-anterior', 0.6],
  ['triceps-long-head', 0.4],
]
const PULL_UP_PRIMARY = [
  ['lats', 1],
  ['teres-major', 0.8],
]
const PULL_UP_SECONDARY = [
  ['biceps-short-head', 0.6],
  ['brachialis', 0.6],
  ['brachioradialis', 0.5],
  ['forearm-flexors', 0.4],
]
const CHIN_UP_PRIMARY = [
  ['lats', 1],
  ['teres-major', 0.8],
]
const CHIN_UP_SECONDARY = [
  ['biceps-short-head', 0.6],
  ['biceps-long-head', 0.6],
  ['brachialis', 0.5],
  ['forearm-flexors', 0.4],
]
const CABLE_CHEST_PRIMARY = [
  ['middle-chest', 1],
  ['inner-chest', 0.8],
]
const CABLE_CHEST_SECONDARY = [
  ['upper-chest', 0.3],
  ['lower-chest', 0.3],
  ['front-delts', 0.2],
]
const CABLE_CRUNCH_PRIMARY = [
  ['upper-abs', 1],
  ['lower-abs', 0.8],
]
const CABLE_CRUNCH_SECONDARY = [
  ['obliques', 0.5],
  ['transverse-abdominis', 0.4],
]
const PLANK_PRIMARY = [
  ['transverse-abdominis', 1],
  ['upper-abs', 0.8],
]
const PLANK_SECONDARY = [
  ['obliques', 0.6],
  ['lower-abs', 0.5],
  ['serratus-anterior', 0.4],
]
const SIDE_PLANK_PRIMARY = [
  ['obliques', 1],
  ['transverse-abdominis', 0.8],
]
const SIDE_PLANK_SECONDARY = [
  ['glute-med', 0.5],
  ['lower-abs', 0.3],
]
const HIP_ABDUCTION_PRIMARY = [
  ['glute-med', 1],
  ['glute-min', 0.9],
]
const HIP_ABDUCTION_SECONDARY = [
  ['glute-max', 0.5],
  ['tensor-fasciae-latae', 0.5],
]
const VERTICAL_PULL_SECONDARY = [
  ['biceps-short-head', 0.5],
  ['brachialis', 0.6],
  ['brachioradialis', 0.5],
  ['forearm-flexors', 0.4],
]
const SUPINATED_VERTICAL_PULL_SECONDARY = [
  ['biceps-short-head', 0.6],
  ['biceps-long-head', 0.6],
  ['brachialis', 0.5],
  ['forearm-flexors', 0.4],
]
const LEG_CURL_PRIMARY = [
  ['biceps-femoris', 1],
  ['semitendinosus', 0.9],
  ['semimembranosus', 0.9],
]
const LEG_CURL_SECONDARY = [['gastrocnemius', 0.4]]
const LEG_EXTENSION_PRIMARY = [
  ['rectus-femoris', 1],
  ['vastus-lateralis', 1],
  ['vastus-medialis', 0.9],
  ['vastus-intermedius', 0.8],
]
const LEG_PRESS_PRIMARY = [
  ['vastus-lateralis', 1],
  ['rectus-femoris', 0.9],
  ['vastus-medialis', 0.8],
]
const LEG_PRESS_SECONDARY = [
  ['vastus-intermedius', 0.7],
  ['glute-max', 0.6],
  ['adductor-magnus', 0.4],
]
const CALF_PRESS_PRIMARY = [['gastrocnemius', 1]]
const CALF_PRESS_SECONDARY = [['soleus', 0.8]]
const SEATED_CALF_PRIMARY = [['soleus', 1]]
const SEATED_CALF_SECONDARY = [['gastrocnemius', 0.5]]
const PUSH_UP_PRIMARY = [['middle-chest', 1]]
const PUSH_UP_SECONDARY = [
  ['upper-chest', 0.5],
  ['lower-chest', 0.4],
  ['inner-chest', 0.6],
  ['front-delts', 0.5],
  ['triceps-lateral-head', 0.5],
  ['triceps-medial-head', 0.4],
  ['serratus-anterior', 0.4],
]
const REVERSE_CRUNCH_PRIMARY = [
  ['lower-abs', 1],
  ['upper-abs', 0.7],
]
const REVERSE_CRUNCH_SECONDARY = [
  ['obliques', 0.4],
  ['transverse-abdominis', 0.3],
]
const ROMANIAN_DEADLIFT_PRIMARY = [
  ['biceps-femoris', 1],
  ['semitendinosus', 0.9],
  ['glute-max', 0.9],
]
const ROMANIAN_DEADLIFT_SECONDARY = [
  ['semimembranosus', 0.8],
  ['spinal-erectors', 0.7],
  ['adductor-magnus', 0.4],
]
const REVERSE_HYPER_PRIMARY = [
  ['glute-max', 1],
  ['spinal-erectors', 0.8],
]
const REVERSE_HYPER_SECONDARY = [
  ['biceps-femoris', 0.6],
  ['semitendinosus', 0.5],
  ['semimembranosus', 0.5],
]
const SUMO_DEADLIFT_PRIMARY = [
  ['glute-max', 1],
  ['adductor-magnus', 0.9],
  ['spinal-erectors', 0.8],
]
const SUMO_DEADLIFT_SECONDARY = [
  ['biceps-femoris', 0.7],
  ['semitendinosus', 0.6],
  ['semimembranosus', 0.6],
  ['rectus-femoris', 0.4],
  ['forearm-flexors', 0.5],
]
const PIN_PRESS_PRIMARY = [
  ['middle-chest', 0.9],
  ['triceps-long-head', 0.8],
  ['triceps-lateral-head', 0.8],
]
const PIN_PRESS_SECONDARY = [
  ['upper-chest', 0.4],
  ['inner-chest', 0.4],
  ['front-delts', 0.5],
  ['triceps-medial-head', 0.6],
]
const TRICEPS_OVERHEAD_PRIMARY = [
  ['triceps-long-head', 1],
  ['triceps-lateral-head', 0.8],
  ['triceps-medial-head', 0.7],
]
const TRICEPS_OVERHEAD_SECONDARY = [['front-delts', 0.2]]
const TRICEPS_PRESSDOWN_PRIMARY = [
  ['triceps-lateral-head', 1],
  ['triceps-medial-head', 0.9],
]
const TRICEPS_PRESSDOWN_SECONDARY = [['triceps-long-head', 0.6]]
const HAMMER_CURL_PRIMARY = [
  ['brachialis', 1],
  ['brachioradialis', 0.9],
]
const HAMMER_CURL_SECONDARY = [
  ['biceps-long-head', 0.6],
  ['biceps-short-head', 0.4],
  ['forearm-flexors', 0.4],
]
const ROWING_PRIMARY = [
  ['lats', 0.8],
  ['rhomboids', 0.7],
  ['rectus-femoris', 0.7],
]
const ROWING_SECONDARY = [
  ['mid-traps', 0.5],
  ['glute-max', 0.6],
  ['biceps-femoris', 0.5],
  ['forearm-flexors', 0.5],
]
const RUNNING_PRIMARY = [
  ['rectus-femoris', 0.8],
  ['vastus-lateralis', 0.7],
  ['gastrocnemius', 0.8],
]
const RUNNING_SECONDARY = [
  ['glute-max', 0.7],
  ['biceps-femoris', 0.6],
  ['soleus', 0.6],
  ['glute-med', 0.5],
]
const STATIONARY_BIKE_PRIMARY = [
  ['rectus-femoris', 0.8],
  ['vastus-lateralis', 0.8],
  ['vastus-medialis', 0.7],
]
const STATIONARY_BIKE_SECONDARY = [
  ['vastus-intermedius', 0.6],
  ['glute-max', 0.5],
  ['biceps-femoris', 0.4],
  ['gastrocnemius', 0.4],
  ['soleus', 0.3],
]
const SISSY_SQUAT_PRIMARY = [
  ['rectus-femoris', 1],
  ['vastus-lateralis', 0.9],
  ['vastus-medialis', 0.9],
]
const SISSY_SQUAT_SECONDARY = [
  ['vastus-intermedius', 0.8],
  ['glute-max', 0.2],
]
const UPRIGHT_ROW_PRIMARY = [
  ['side-delts', 0.9],
  ['upper-traps', 0.8],
]
const UPRIGHT_ROW_SECONDARY = [['front-delts', 0.4]]
const GLUTE_KICKBACK_PRIMARY = [['glute-max', 1]]
const GLUTE_KICKBACK_SECONDARY = [
  ['glute-med', 0.6],
  ['glute-min', 0.4],
  ['biceps-femoris', 0.3],
]
const MACHINE_GLUTE_KICKBACK_PRIMARY = [
  ['glute-max', 1],
  ['glute-med', 0.7],
]
const MACHINE_GLUTE_KICKBACK_SECONDARY = [
  ['glute-min', 0.5],
  ['biceps-femoris', 0.3],
]
const WRIST_CURL_PRIMARY = [['forearm-flexors', 1]]
const WRIST_CURL_SECONDARY = [['brachioradialis', 0.4]]
const REVERSE_WRIST_CURL_PRIMARY = [['forearm-extensors', 1]]
const REVERSE_WRIST_CURL_SECONDARY = [['brachioradialis', 0.4]]
const WRIST_ROLLER_PRIMARY = [
  ['forearm-flexors', 0.9],
  ['forearm-extensors', 0.8],
]
const WRIST_ROLLER_SECONDARY = [['brachioradialis', 0.5]]
const NECK_FLEXION_PRIMARY = [['sternocleidomastoid', 1]]
const NECK_FLEXION_SECONDARY = [
  ['omohyoid', 0.5],
  ['neck', 0.4],
]
const NECK_EXTENSION_PRIMARY = [['neck', 1]]
const NECK_EXTENSION_SECONDARY = [['upper-traps', 0.5]]
const NECK_LATERAL_PRIMARY = [['neck', 1]]
const NECK_LATERAL_SECONDARY = [
  ['sternocleidomastoid', 0.5],
  ['upper-traps', 0.3],
]

const EXACT_TARGETS = new Map([
  ['ab-wheel-rollout', [ROLLOUT_PRIMARY, ROLLOUT_SECONDARY]],
  ['adductor-machine', [ADDUCTOR_PRIMARY, ADDUCTOR_SECONDARY]],
  ['arnold-press', [SHOULDER_PRESS_PRIMARY, SHOULDER_PRESS_SECONDARY]],
  ['assisted-dip', [DIP_PRESS_PRIMARY, DIP_PRESS_SECONDARY]],
  ['assisted-pistol-squat', [SPLIT_SQUAT_PRIMARY, SPLIT_SQUAT_SECONDARY]],
  ['assisted-pull-up', [PULL_UP_PRIMARY, PULL_UP_SECONDARY]],
  ['back-extension', [HINGE_BACK_EXTENSION_PRIMARY, HINGE_BACK_EXTENSION_SECONDARY]],
  ['back-squat', [SQUAT_PRIMARY, SQUAT_SECONDARY]],
  ['barbell-bench-press', [FLAT_PRESS_PRIMARY, FLAT_PRESS_SECONDARY]],
  ['barbell-bent-over-row', [ROW_PRIMARY, ROW_SECONDARY]],
  ['barbell-concentration-curl', [CURL_CONCENTRATION_PRIMARY, CURL_CONCENTRATION_SECONDARY]],
  ['barbell-hip-thrust', [HIP_THRUST_PRIMARY, HIP_THRUST_SECONDARY]],
  [
    'barbell-hip-thrust-or-romanian-deadlift',
    [HIP_THRUST_HINGE_PRIMARY, HIP_THRUST_HINGE_SECONDARY],
  ],
  ['barbell-incline-press', [INCLINE_PRESS_PRIMARY, INCLINE_PRESS_SECONDARY]],
  ['bent-over-smith-row', [ROW_PRIMARY, ROW_SECONDARY]],
  ['bulgarian-split-squat', [SPLIT_SQUAT_PRIMARY, SPLIT_SQUAT_SECONDARY]],
  ['cable-adductor-raises', [ADDUCTOR_PRIMARY, ADDUCTOR_SECONDARY]],
  ['cable-concentration-curl', [CURL_CONCENTRATION_PRIMARY, CURL_CONCENTRATION_SECONDARY]],
  ['cable-flye', [CABLE_CHEST_PRIMARY, CABLE_CHEST_SECONDARY]],
  ['cable-pull-over', [PULLOVER_PRIMARY, PULLOVER_SECONDARY]],
  ['cable-pull-through', [PULL_THROUGH_PRIMARY, PULL_THROUGH_SECONDARY]],
  ['cable-reverse-flye', [REVERSE_FLY_PRIMARY, REVERSE_FLY_SECONDARY]],
  ['cable-seated-row', [ROW_PRIMARY, ROW_SECONDARY]],
  ['cable-single-arm-row', [ROW_PRIMARY, ROW_SECONDARY]],
  ['cable-tricep-kickback', [KICKBACK_PRIMARY, KICKBACK_SECONDARY]],
  ['chest-supported-dumbbell-row', [ROW_PRIMARY, ROW_SECONDARY]],
  ['chest-supported-row', [ROW_PRIMARY, ROW_SECONDARY]],
  ['chest-supported-t-bar-row', [ROW_PRIMARY, ROW_SECONDARY]],
  ['chest-supported-t-bar-row-pronated-grip', [ROW_PRIMARY, ROW_SECONDARY]],
  ['chin-up', [CHIN_UP_PRIMARY, CHIN_UP_SECONDARY]],
  [
    'close-grip-bench-press',
    [
      [
        ['triceps-long-head', 1],
        ['triceps-lateral-head', 0.9],
        ['triceps-medial-head', 0.8],
      ],
      [
        ['middle-chest', 0.6],
        ['inner-chest', 0.4],
        ['front-delts', 0.4],
      ],
    ],
  ],
  ['conventional-deadlift', [DEADLIFT_PRIMARY, DEADLIFT_SECONDARY]],
  ['decline-barbell-press', [DECLINE_PRESS_PRIMARY, DECLINE_PRESS_SECONDARY]],
  ['decline-bench-press', [DECLINE_PRESS_PRIMARY, DECLINE_PRESS_SECONDARY]],
  ['decline-dumbbell-press', [DECLINE_PRESS_PRIMARY, DECLINE_PRESS_SECONDARY]],
  ['decline-leg-raise', [LEG_RAISE_PRIMARY, LEG_RAISE_SECONDARY]],
  ['deficit-push-up', [FLAT_PRESS_PRIMARY, FLAT_PRESS_SECONDARY]],
  ['dip', [DIP_PRESS_PRIMARY, DIP_PRESS_SECONDARY]],
  ['dumbbell-bench-press', [FLAT_PRESS_PRIMARY, FLAT_PRESS_SECONDARY]],
  ['dumbbell-bent-over-lateral-raise', [REVERSE_FLY_PRIMARY, REVERSE_FLY_SECONDARY]],
  ['dumbbell-chest-supported-row', [ROW_PRIMARY, ROW_SECONDARY]],
  ['dumbbell-concentration-curl', [CURL_CONCENTRATION_PRIMARY, CURL_CONCENTRATION_SECONDARY]],
  ['dumbbell-floor-press', [FLAT_PRESS_PRIMARY, FLAT_PRESS_SECONDARY]],
  ['dumbbell-fly', [FLAT_FLY_PRIMARY, FLAT_FLY_SECONDARY]],
  ['dumbbell-flye', [FLAT_FLY_PRIMARY, FLAT_FLY_SECONDARY]],
  ['dumbbell-incline-press', [INCLINE_PRESS_PRIMARY, INCLINE_PRESS_SECONDARY]],
  ['dumbbell-kickback', [KICKBACK_PRIMARY, KICKBACK_SECONDARY]],
  ['dumbbell-press', [SHOULDER_PRESS_PRIMARY, SHOULDER_PRESS_SECONDARY]],
  ['dumbbell-row', [ROW_PRIMARY, ROW_SECONDARY]],
  ['dumbbell-seal-row', [ROW_PRIMARY, ROW_SECONDARY]],
  ['dumbbell-seated-shoulder-press', [SHOULDER_PRESS_PRIMARY, SHOULDER_PRESS_SECONDARY]],
  ['dumbbell-single-leg-hip-thrust', [HIP_THRUST_PRIMARY, HIP_THRUST_SECONDARY]],
  ['dumbbell-step-up', [SPLIT_SQUAT_PRIMARY, SPLIT_SQUAT_SECONDARY]],
  ['dumbbell-walking-lunge', [SPLIT_SQUAT_PRIMARY, SPLIT_SQUAT_SECONDARY]],
  ['face-pull', [FACE_PULL_PRIMARY, FACE_PULL_SECONDARY]],
  ['flat-dumbbell-press', [FLAT_PRESS_PRIMARY, FLAT_PRESS_SECONDARY]],
  ['floor-press', [FLAT_PRESS_PRIMARY, FLAT_PRESS_SECONDARY]],
  ['front-squat', [FRONT_SQUAT_PRIMARY, FRONT_SQUAT_SECONDARY]],
  ['glute-bridge', [HIP_THRUST_PRIMARY, HIP_THRUST_SECONDARY]],
  ['goblet-squat', [SQUAT_PRIMARY, SQUAT_SECONDARY]],
  ['hack-squat', [HACK_SQUAT_PRIMARY, HACK_SQUAT_SECONDARY]],
  ['hammer-strength-decline-press', [DECLINE_PRESS_PRIMARY, DECLINE_PRESS_SECONDARY]],
  ['hammer-strength-machine-incline-press', [INCLINE_PRESS_PRIMARY, INCLINE_PRESS_SECONDARY]],
  ['hammer-strength-machine-press', [FLAT_PRESS_PRIMARY, FLAT_PRESS_SECONDARY]],
  ['hanging-leg-raise', [LEG_RAISE_PRIMARY, LEG_RAISE_SECONDARY]],
  ['helms-row', [ROW_PRIMARY, ROW_SECONDARY]],
  ['hollow-body-hold', [ROLLOUT_PRIMARY, ROLLOUT_SECONDARY]],
  ['humble-row', [ROW_PRIMARY, ROW_SECONDARY]],
  ['hyperextension', [HINGE_BACK_EXTENSION_PRIMARY, HINGE_BACK_EXTENSION_SECONDARY]],
  ['incline-dumbbell-curl', [CURL_INCLINE_PRIMARY, CURL_INCLINE_SECONDARY]],
  ['incline-dumbbell-press', [INCLINE_PRESS_PRIMARY, INCLINE_PRESS_SECONDARY]],
  ['incline-pectoral-flye-cable', [INCLINE_FLY_PRIMARY, INCLINE_FLY_SECONDARY]],
  ['incline-pectoral-flye-dumbbell', [INCLINE_FLY_PRIMARY, INCLINE_FLY_SECONDARY]],
  [
    'jm-press',
    [
      [
        ['triceps-long-head', 1],
        ['triceps-lateral-head', 0.9],
        ['triceps-medial-head', 0.8],
      ],
      [
        ['middle-chest', 0.4],
        ['front-delts', 0.4],
      ],
    ],
  ],
])

assignTargets(['kneeling-cable-crunch'], CABLE_CRUNCH_PRIMARY, CABLE_CRUNCH_SECONDARY)
assignTargets(
  [
    'lateral-band-walk',
    'plate-loaded-hip-abduction',
    'seated-hip-abduction',
    'standing-cable-hip-abduction',
  ],
  HIP_ABDUCTION_PRIMARY,
  HIP_ABDUCTION_SECONDARY,
)
assignTargets(
  [
    'laterally-dumbbell-seated-shoulder-press',
    'machine-shoulder-press',
    'overhead-press',
    'seated-barbell-overhead-press',
    'seated-smith-press',
    'shoulder-press-machine',
    'standing-dumbbell-shoulder-press',
  ],
  SHOULDER_PRESS_PRIMARY,
  SHOULDER_PRESS_SECONDARY,
)
assignTargets(
  [
    'lat-pulldown',
    'neutral-grip-pulldown',
    'neutral-grip-pull-up',
    'pronated-pulldown',
    'pull-up',
    'single-arm-pulldown',
  ],
  PULL_UP_PRIMARY,
  VERTICAL_PULL_SECONDARY,
)
assignTargets(
  ['reverse-grip-assisted-pull-up', 'reverse-grip-lat-pulldown', 'supinated-pulldown'],
  CHIN_UP_PRIMARY,
  SUPINATED_VERTICAL_PULL_SECONDARY,
)
assignTargets(
  [
    'leg-curl',
    'lying-leg-curl',
    'seated-leg-curl',
    'single-leg-leg-curl',
    'single-leg-lying-leg-curl',
    'sliding-leg-curl',
    'swiss-ball-leg-curl',
  ],
  LEG_CURL_PRIMARY,
  LEG_CURL_SECONDARY,
)
assignTargets(
  ['leg-extension', 'single-leg-extension', 'single-leg-leg-extension'],
  LEG_EXTENSION_PRIMARY,
  [],
)
assignTargets(['leg-extension-machine-hip-thrust'], HIP_THRUST_PRIMARY, HIP_THRUST_SECONDARY)
assignTargets(['leg-press', 'single-leg-leg-press', 'single-leg-press'], LEG_PRESS_PRIMARY, LEG_PRESS_SECONDARY)
assignTargets(
  ['leg-press-calf-press', 'slow-eccentric-leg-press-toe-press', 'smith-machine-calf-raise', 'standing-calf-raise'],
  CALF_PRESS_PRIMARY,
  CALF_PRESS_SECONDARY,
)
assignTargets(['seated-calf-raise'], SEATED_CALF_PRIMARY, SEATED_CALF_SECONDARY)
assignTargets(
  [
    'low-incline-barbell-press',
    'low-incline-dumbbell-press',
    'low-incline-machine-press',
    'machine-incline-chest-press',
  ],
  INCLINE_PRESS_PRIMARY,
  INCLINE_PRESS_SECONDARY,
)
assignTargets(['low-to-high-cable-flye'], INCLINE_FLY_PRIMARY, INCLINE_FLY_SECONDARY)
assignTargets(['lat-prayer', 'lying-dumbbell-pullover'], PULLOVER_PRIMARY, PULLOVER_SECONDARY)
assignTargets(['machine-chest-press', 'smith-machine-bench-press'], FLAT_PRESS_PRIMARY, FLAT_PRESS_SECONDARY)
assignTargets(['machine-dip'], DIP_PRESS_PRIMARY, DIP_PRESS_SECONDARY)
assignTargets(
  ['pec-deck', 'pectoral-flye-cable', 'pectoral-flye-machine', 'standing-cable-flye'],
  FLAT_FLY_PRIMARY,
  FLAT_FLY_SECONDARY,
)
assignTargets(
  [
    'machine-row-both-with-chest-support',
    'pendlay-row',
    'seal-row',
    'single-arm-machine-row',
    'smith-machine-pendlay-row',
    't-bar-row',
  ],
  ROW_PRIMARY,
  ROW_SECONDARY,
)
assignTargets(
  [
    'rear-delt-flye-cable',
    'rear-delt-flye-dumbbell',
    'rear-delt-flye-machine',
    'reverse-cable-crossover',
    'reverse-cable-flye',
    'reverse-dumbbell-flye',
    'reverse-pec-deck',
  ],
  REVERSE_FLY_PRIMARY,
  REVERSE_FLY_SECONDARY,
)
assignTargets(['pin-press'], PIN_PRESS_PRIMARY, PIN_PRESS_SECONDARY)
assignTargets(['plank', 'long-lever-plank'], PLANK_PRIMARY, PLANK_SECONDARY)
assignTargets(['push-up'], PUSH_UP_PRIMARY, PUSH_UP_SECONDARY)
assignTargets(['reverse-crunch'], REVERSE_CRUNCH_PRIMARY, REVERSE_CRUNCH_SECONDARY)
assignTargets(['reverse-hyper'], REVERSE_HYPER_PRIMARY, REVERSE_HYPER_SECONDARY)
assignTargets(['reverse-lunge', 'smith-machine-split-squat', 'static-lunge'], SPLIT_SQUAT_PRIMARY, SPLIT_SQUAT_SECONDARY)
assignTargets(['roman-chair-leg-raise'], LEG_RAISE_PRIMARY, LEG_RAISE_SECONDARY)
assignTargets(['romanian-deadlift'], ROMANIAN_DEADLIFT_PRIMARY, ROMANIAN_DEADLIFT_SECONDARY)
assignTargets(['rope-face-pull', 'seated-face-pull'], FACE_PULL_PRIMARY, FACE_PULL_SECONDARY)
assignTargets(['rope-hammer-curl', 'seated-hammer-curl'], HAMMER_CURL_PRIMARY, HAMMER_CURL_SECONDARY)
assignTargets(
  [
    'overhead-cable-extension',
    'overhead-tricep-extension',
    'rope-overhead-triceps-extension',
    'single-arm-rope-tricep-extension',
  ],
  TRICEPS_OVERHEAD_PRIMARY,
  TRICEPS_OVERHEAD_SECONDARY,
)
assignTargets(['rowing-ergometer'], ROWING_PRIMARY, ROWING_SECONDARY)
assignTargets(['running'], RUNNING_PRIMARY, RUNNING_SECONDARY)
assignTargets(['smith-machine-squat'], SQUAT_PRIMARY, SQUAT_SECONDARY)
assignTargets(['side-plank'], SIDE_PLANK_PRIMARY, SIDE_PLANK_SECONDARY)
assignTargets(['sissy-squat'], SISSY_SQUAT_PRIMARY, SISSY_SQUAT_SECONDARY)
assignTargets(['stationary-bike'], STATIONARY_BIKE_PRIMARY, STATIONARY_BIKE_SECONDARY)
assignTargets(['sumo-deadlift'], SUMO_DEADLIFT_PRIMARY, SUMO_DEADLIFT_SECONDARY)
assignTargets(['tricep-extension-machine', 'tricep-pressdown'], TRICEPS_PRESSDOWN_PRIMARY, TRICEPS_PRESSDOWN_SECONDARY)
assignTargets(['upright-row-cable', 'upright-row-ez-bar'], UPRIGHT_ROW_PRIMARY, UPRIGHT_ROW_SECONDARY)
assignTargets(['v-sit-up'], LEG_RAISE_PRIMARY, LEG_RAISE_SECONDARY)
assignTargets(['walking-lunge'], SPLIT_SQUAT_PRIMARY, SPLIT_SQUAT_SECONDARY)
assignTargets(['weighted-dip'], DIP_PRESS_PRIMARY, DIP_PRESS_SECONDARY)
assignTargets(['weighted-pull-up', 'wide-grip-lat-pulldown'], PULL_UP_PRIMARY, VERTICAL_PULL_SECONDARY)
assignTargets(['cable-glute-kickback'], GLUTE_KICKBACK_PRIMARY, GLUTE_KICKBACK_SECONDARY)
assignTargets(['machine-glute-kickback'], MACHINE_GLUTE_KICKBACK_PRIMARY, MACHINE_GLUTE_KICKBACK_SECONDARY)
assignTargets(['wrist-curl'], WRIST_CURL_PRIMARY, WRIST_CURL_SECONDARY)
assignTargets(['reverse-wrist-curl'], REVERSE_WRIST_CURL_PRIMARY, REVERSE_WRIST_CURL_SECONDARY)
assignTargets(['wrist-roller'], WRIST_ROLLER_PRIMARY, WRIST_ROLLER_SECONDARY)
assignTargets(['neck-flexion'], NECK_FLEXION_PRIMARY, NECK_FLEXION_SECONDARY)
assignTargets(['neck-extension'], NECK_EXTENSION_PRIMARY, NECK_EXTENSION_SECONDARY)
assignTargets(['neck-lateral-flexion'], NECK_LATERAL_PRIMARY, NECK_LATERAL_SECONDARY)

let changedCount = 0

for (const name of fs.readdirSync(exercisesDir).sort()) {
  if (!name.endsWith('.json') || name === 'index.json') {
    continue
  }

  const id = name.replace(/\.json$/, '')

  if (!selectedLetters.has(id[0]?.toLowerCase())) {
    continue
  }

  const nextTargets = EXACT_TARGETS.get(id)

  if (!nextTargets) {
    continue
  }

  const filePath = path.join(exercisesDir, name)
  const record = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const [primary, secondary] = nextTargets
  const nextPrimary = createTargetEntries(primary)
  const nextSecondary = createTargetEntries(secondary)

  if (
    targetsEqual(record.primaryTargetMuscleGroups, nextPrimary) &&
    targetsEqual(record.secondaryTargetMuscleGroups, nextSecondary)
  ) {
    continue
  }

  record.primaryTargetMuscleGroups = nextPrimary
  record.secondaryTargetMuscleGroups = nextSecondary
  fs.writeFileSync(filePath, `${JSON.stringify(record, null, 2)}\n`)
  changedCount += 1
}

console.log(
  `Updated muscle targets in ${changedCount} exercise files for letters ${[
    ...selectedLetters,
  ]
    .sort()
    .join('')}.`,
)

function expandLetterArgs(values) {
  const letters = new Set()

  for (const value of values) {
    const normalized = value.toLowerCase()

    if (/^[a-z]-[a-z]$/.test(normalized)) {
      const [start, end] = normalized.split('-')
      const startCode = start.charCodeAt(0)
      const endCode = end.charCodeAt(0)

      for (let code = Math.min(startCode, endCode); code <= Math.max(startCode, endCode); code += 1) {
        letters.add(String.fromCharCode(code))
      }

      continue
    }

    for (const letter of normalized.replace(/[^a-z]/g, '')) {
      letters.add(letter)
    }
  }

  return letters
}

function createTargetEntries(entries) {
  return entries.map(([muscleGroup, factor]) => ({
    muscleGroup,
    factor,
  }))
}

function targetsEqual(left, right) {
  return JSON.stringify(left ?? []) === JSON.stringify(right ?? [])
}

function assignTargets(ids, primary, secondary) {
  for (const id of ids) {
    EXACT_TARGETS.set(id, [primary, secondary])
  }
}
