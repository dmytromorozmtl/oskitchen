# Implementation & Go-Live Center — architecture

## Goals

Turn `/dashboard/implementation` from a one-form project intake into a
full **Implementation & Go-Live Center** that answers the ten owner /
CS-led onboarding questions: what business, which modules, what data,
which integrations, what training, what blocks go-live, is the
workspace ready, who owns each task, what happens on launch day, and
what happens after.

## Module map

```
app/dashboard/implementation/
  layout.tsx                       Subnav wrapper
  page.tsx                         Implementation Center overview
  new/page.tsx                     9-step wizard
  projects/page.tsx                All projects
  checklist/page.tsx               Redirect to active project checklist
  migration/page.tsx               Redirect to active project migration
  integrations/page.tsx            Redirect to active project integrations
  training/page.tsx                Redirect to active project training
  uat/page.tsx                     Redirect to active project UAT
  go-live/page.tsx                 Redirect to active project go-live
  risks/page.tsx                   Redirect to active project risks
  activity/page.tsx                Redirect to active project activity
  reports/page.tsx                 Implementation reports (rolled-up)
  [projectId]/
    page.tsx                       Project overview
    checklist/page.tsx             Phase-grouped checklist + task gen
    timeline/page.tsx              Phase progress
    migration/page.tsx             Datasets + recent imports
    integrations/page.tsx          IntegrationConnection status mapped
    training/page.tsx              Role × module matrix
    uat/page.tsx                   Scenarios
    go-live/page.tsx               Readiness + launch plan
    risks/page.tsx                 Risks (add/resolve)
    activity/page.tsx              Audit log
```

## Layers

```
lib/implementation/
  implementation-types.ts          Types, enums, constants
  implementation-status.ts         Status / priority labels + predicates
  implementation-permissions.ts    Role-based capability matrix
  implementation-checklists.ts     Phase-aware checklist templates
  go-live-readiness.ts             Pure summariser for readiness checks

services/implementation/
  implementation-service.ts        Projects, phases, checklist, risks, audit
  readiness-service.ts             Live-data readiness checks + persistence

actions/implementation-center.ts   Server actions (create, status, checklist, risk, readiness, tasks)
```

The legacy `actions/implementation.ts` is preserved — it powers the
historical `/dashboard/implementation` form path and the Import Center.

## Data path

1. Wizard collects scope, posts to `createImplementationProjectAction`.
2. `createImplementationProjectV2` writes one
   `ImplementationProject` row, then seeds:
   - one `ImplementationPhase` per phase definition
   - one `ImplementationChecklistItem` per checklist seed for the
     business type.
3. UI loads project via `getProject(userId, projectId)`.
4. Owner runs the readiness engine; `readiness-service.ts` reads real
   workspace data and writes `GoLiveReadinessCheck` rows + a summary
   snapshot on the project.
5. Owner generates tasks: preview first, then create `KitchenTask`
   rows with `sourceType = IMPLEMENTATION` and `sourceId = projectId`.
6. Every state change writes an `ImplementationEvent`.

## Safety contract

- No imports happen here — Implementation links to Import Center only.
- No templates are applied silently — Implementation only recommends.
- No live order data is touched.
- Integration status reads real `IntegrationConnection` rows;
  placeholders are honest.
- `markGoLiveAction` reruns readiness and refuses to flip status if
  any required check fails.
