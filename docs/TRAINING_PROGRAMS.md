# Training programs

Programs are the top-level curriculum unit. Each program has a role focus,
difficulty, language, optional brand/location scoping, and a structured tree
of modules → lessons → (optional) quizzes.

## Seed templates

`lib/training/assignment-engine.ts` exports `ROLE_PROGRAM_TEMPLATES` covering
14 roles:

- `KITCHEN_STAFF` — orientation, food safety, production board, kitchen quiz, lunch-rush sim.
- `PACKING_STAFF` — packing flow, label verification, scan training, mismatch sim, quiz.
- `MANAGER` — order hub triage, reports, allergy drill.
- `DELIVERY_DRIVER` — driver app overview, failed-delivery drill.
- `PREP_COOK` — mise en place.
- `LINE_COOK` — ticket pacing.
- `EXECUTIVE_CHEF` — menu engineering.
- `OPERATIONS_MANAGER` — escalations.
- `INVENTORY_MANAGER` — counts and pars.
- `CATERING_COORDINATOR` — quote-to-order, catering prep sim.
- `CUSTOMER_SUPPORT` — tone and templates.
- `ADMIN` — permissions overview.
- `IMPLEMENTATION_MANAGER` — Go-live process.
- `GENERAL` — welcome only.

Creating a program with a `seedFromTemplate` value populates modules and
lessons automatically. Otherwise the program is empty and editable.

## Lesson types

`TrainingLessonType`:

`TEXT`, `VIDEO`, `PDF`, `DIAGRAM`, `INTERACTIVE_CHECKLIST`, `WALKTHROUGH`,
`IMAGE_TASK`, `SIMULATION`, `QUIZ`, `SOP_ACK`.

## Assignment lifecycle

```
ASSIGNED → IN_PROGRESS → COMPLETED
           ↓                ↓
       NEEDS_REVIEW   (manager issues certification)
           ↓
        FAILED / EXPIRED / WAIVED
```

The assignment status is derived from completion + due date + quiz outcomes
(`deriveAssignmentStatus` in `lib/training/training-engine.ts`).
