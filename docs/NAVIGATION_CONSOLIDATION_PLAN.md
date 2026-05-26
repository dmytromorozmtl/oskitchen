# Navigation consolidation plan

**Principle:** Do not delete routes without safe redirects or tab consolidation. Prefer **one primary sidebar entry** per operational domain.

## Candidate overlaps

| Area | Current entries | Primary (proposed) | Secondary placement | Redirect / alias |
|------|-------------------|--------------------|----------------------|------------------|
| Orders | Orders, Order hub | **Order hub** (multi-channel) or **Orders** (simple venues) — product decision | Tabs: list / channel health / manual | Keep both URLs; default nav shows one based on `businessType` + feature flag |
| Packing | Packing & labels, Packing verify | **Packing & labels** | Tab: Verify scanner | `/dashboard/packing/verify` remains deep link |
| Insights | Analytics, Reports, Executive | **Reports** for most; Executive for multi-brand | Cross-links in page headers | No URL removal |
| Notifications | Notifications, Alert rules | **Notifications** | Tab: Rules | Existing subpath |
| Rollout | Implementation, Go-live, Training | **Go-live** as hero | Linked checklist pages | Keep URLs for bookmarks |
| Growth / Beta | Growth, Beta applications | **Growth** (internal) | Subnav already exists | `internalOnly` registry flags |
| Menus | Weekly menus, Menu planner | **Weekly menus** | Planner as subflow or tab | Both routes kept |

## Execution phases

1. **Analytics** — add “Open reports” CTA inside analytics page (no route change).  
2. **Orders** — A/B label test via `moduleModeHints` + nav copy only.  
3. **Packing** — surface verify from packing index card.  
4. **Implementation vs training** — interlink only (P2).

## Super-admin

All historical URLs remain reachable for **`workspace.moroz@gmail.com`** / platform bypass regardless of sidebar primary.

## Risks

- Hiding **Order hub** for wrong segment could block power users — mitigate with module settings + reset to recommended.
