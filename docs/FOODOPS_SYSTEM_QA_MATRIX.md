# FoodOps system QA matrix

Run after changes to navigation, module gates, onboarding, Today, or business-mode registry.

**Automated gate:** `npm run typecheck` and `npm run build` (must pass before release).

## Per business mode (manual)

| Check | Pass criteria |
| --- | --- |
| Onboarding | Completes; optional workflow saved; lands on `/dashboard/today`. |
| Navigation | **Today** group shows Today + Dashboard + Calendar; **Orders & sales** has storefront + channels; focused mode hides advanced modules until expanded. |
| Module settings | Each row shows description + **recommendation blurb** for current business type; reset to recommended works. |
| Terminology | Spot-check nav: meal prep “Preorders”, bar “Event requests”, storefront overrides (e.g. weekly menu site). |
| Today Board | KPI cards load; quiet-day empty state + next best action visible when no data; widget list uses human labels. |
| Dashboard | Classic `/dashboard` still reachable from Today. |
| Disabled module | Toggle off a non-core module → route shows disabled page; settings + billing still reachable. |
| Super-admin | `workspace.moroz@gmail.com` / platform bypass: full nav + no module blocks. |
| Playbooks | `/dashboard/playbooks` lists mode-relevant playbooks first. |
| Templates | `/dashboard/templates` lists quick-start cards from registry. |
| Demo | Each `/demo/[slug]` loads; post-demo redirect to Today (if applicable). |
| Command palette | Cmd/Ctrl+K opens; search finds production, kitchen, brands. |

## Regression smoke (5 min)

1. Login as owner → lands Today (after onboarding).
2. Login as staff → lands kitchen screen.
3. Toggle “Show all modules” → rollout + internal links appear (owner).
4. Integration health: Today shows webhook/integration alerts when counts > 0.
