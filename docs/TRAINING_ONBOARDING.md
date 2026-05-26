# Onboarding system

Onboarding is implemented as a `TrainingProgram` with
`isOnboardingPath = true`. The role-template seeds shipped with the system
already follow the 10-stage onboarding workflow described in the spec:

1. **Welcome** — `ONBOARDING` module with a `TEXT` lesson.
2. **Account setup** — `INTERACTIVE_CHECKLIST` lesson.
3. **Role permissions** — derived from the assigned role + workspace
   permissions (no separate module needed).
4. **SOP review** — `SOP_ACK` lessons linked to active SOPs in the library.
5. **Video walkthroughs** — `VIDEO` / `WALKTHROUGH` lessons.
6. **Simulations** — `SIMULATION` lessons + `TrainingSimulation` runs.
7. **Quizzes** — `QUIZ` lessons + `TrainingQuiz` definitions.
8. **Shadow shift** — `INTERACTIVE_CHECKLIST` lesson handled in person, then
   marked complete.
9. **Supervisor approval** — assignment transitions to `NEEDS_REVIEW`; a
   manager issues a certification once satisfied.
10. **Certification** — `issueCertification` records a
    `TrainingCertification` (with a default validity window).

## KPIs

The Command Center exposes `onboardingInFlight` — count of open assignments
where the program has `isOnboardingPath = true`.

## Multi-language

Onboarding paths can be cloned with `language = FR | ES | DE` if needed.
The seed templates ship in English; localized variants can be added by
copying a program and changing `language`.

## Practice mode

The "General onboarding" template lives behind `isOnboardingPath = true`,
and any assignment can be flagged `practiceMode = true` so no certification
is auto-issued.
