# Beta analytics

## Snapshot (`getBetaOperationsSnapshot`)

- KPI strip: totals, funnel stages, top vertical, acquisition mix, onboarding completion %, waitlist velocity, cohort activation %.
- Time series: weekly applications (56 days).
- Distributions: industry, acquisition sources, lifecycle funnel, feature token frequency.
- Inbox sample: latest 120 leads with cohort + feedback/invite counts.

## Performance

Single page load issues parallel Prisma queries; acceptable until >50k leads. Then:

- Move weekly buckets to SQL `date_trunc`.
- Paginate inbox with cursor + indexes on `(program_stage, created_at)`.

## Growth alignment

Acquisition charts intentionally mirror Growth CRM fields (`utm_*`, `source`) so GTM reporting stays coherent.
