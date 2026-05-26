# Beta feedback loop

## Model

`BetaFeedback` attaches structured rows to `beta_leads` with category, severity, free text, optional requested feature, and source.

## Operations UI

Drawer currently surfaces counts; dedicated feedback composer can call `createBetaFeedback` via a small follow-up action.

## Roadmap

- Link feedback topics to roadmap keys / Linear issues.
- Auto-ingest `AppFeedback` from in-product launcher for activated betas.
