# Implementation Center UI

## Routes

| Route                                               | Purpose                                              |
|-----------------------------------------------------|------------------------------------------------------|
| `/dashboard/implementation`                         | KPIs, active project summary, recent projects, empty |
| `/dashboard/implementation/projects`                | Every project                                        |
| `/dashboard/implementation/new`                     | 9-step wizard                                        |
| `/dashboard/implementation/reports`                 | Implementation reports (rolled-up)                   |
| `/dashboard/implementation/{checklist,migration,…}` | Redirect to active project tab                       |
| `/dashboard/implementation/[projectId]`             | Project detail with sub-tabs                         |
| `/dashboard/implementation/[projectId]/timeline`    | Phase progress                                       |
| `/dashboard/implementation/[projectId]/checklist`   | Phase-grouped checklist + task generation            |
| `/dashboard/implementation/[projectId]/migration`   | Dataset plan + recent imports                        |
| `/dashboard/implementation/[projectId]/integrations`| Tracked integrations + real connection status        |
| `/dashboard/implementation/[projectId]/training`    | Role × module training matrix                        |
| `/dashboard/implementation/[projectId]/uat`         | UAT scenarios                                        |
| `/dashboard/implementation/[projectId]/go-live`     | Readiness + launch plan                              |
| `/dashboard/implementation/[projectId]/risks`       | Risk register                                        |
| `/dashboard/implementation/[projectId]/activity`    | Audit timeline                                       |

## KPI tiles

- Active project
- Readiness score
- Blockers
- Tasks completed
- Days to go-live
- Modules configured
- Integrations connected
- Training items done

## Empty state CTAs

- Start implementation → `/dashboard/implementation/new`
- Use a quick-start template → `/dashboard/templates`
- Open Go-Live checklist → `/dashboard/go-live`
