# Growth — Outreach

## UI

`/dashboard/growth/outreach` — **Sales assistant** (`OutreachForm`) plus **Campaigns** list.

## Data

`OutreachCampaign` stores `name`, `channel`, `audience`, `status`, `metricsJson`.

## Seeding

`seedStarterCampaignIfEmpty()` ensures founders see a template row on first load of Growth overview/outreach.

## Safety

Copy generation uses `OPENAI_API_KEY` only when configured; no auto-send (see existing form description).
