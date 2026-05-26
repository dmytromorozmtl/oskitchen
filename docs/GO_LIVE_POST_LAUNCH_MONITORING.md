# Post-launch monitoring

## What changes when status = LIVE

`transitionStatus({ target: 'LIVE' })`:

- Stamps `liveAt = now()`.
- Sets `monitoringUntil = now() + 7 days`.
- Moves `currentStage` to `POST_LAUNCH_MONITORING`.

The KPI grid then reflects:

- Latest simulation result
- Unresolved incident count
- Pending approvals (should be zero by this point)

## Incident watch

Operators are expected to log every operational issue as a
`GoLiveIncident` for the first 24h / 7d. The incident list is the
launch health timeline — sorted descending by `createdAt`, severity +
status badges visible at a glance.

## Drift detection

`refreshAutoValidation` keeps running after launch. If the readiness
score drops (e.g. a channel breaks or staffing falls to zero), the
project status will move back to `BLOCKED` automatically and the
critical blocker will surface in the UI.

## Closing a launch

Once monitoring concludes successfully, a manager can move the project
to `COMPLETED`. This signals the launch was a success without
forfeiting historical access to the simulation, incident, and event
data — useful for postmortems and customer success.

## Rollback during monitoring

If a critical incident occurs in the first 7 days, the manager can
trigger `ROLLBACK_MODE` from the same page. The lock timestamp
prevents accidental re-approval until the team explicitly transitions
back to `IN_PROGRESS`.
