# UX And Design System Roadmap

Status: information architecture and interface roadmap aligned to module maturity
Primary evidence: `app/dashboard/`, `app/platform/`, `app/dashboard/pos/terminal/page.tsx`, `components/`, `docs/UX_UI_NAVIGATION_AUDIT.md`, `docs/system-reality-model.md`, `docs/feature-maturity-matrix.md`

## Principles
- cashier checkout in seconds
- server order entry fast
- bartender tabs fast
- kitchen readable from distance
- owner understands business in 30 seconds
- setup guided without developer

## Roadmap Areas
| Area | Current state | Gap | Design-system / IA work | Product rule | Tests / verification |
| --- | --- | --- | --- | --- | --- |
| dashboard IA cleanup | broad dashboard surface is larger than a coherent default nav | cognitive overload and maturity mismatch | role-based nav presets and module visibility from maturity config | hidden/preview modules do not appear by default | role-nav tests, visual regression |
| role-based navigation | partial module and plan gating exists | role and permission gating are not canonical | nav derives from permission + module + maturity | UI mirrors server truth | permission/nav tests |
| owner dashboard | dashboard exists with many modules | needs 30-second business clarity | prioritized KPI, alerts, next actions | owner sees business health first | dashboard smoke and visual tests |
| manager dashboard | some operational views exist | no dedicated manager shell | focused orders, kitchen, staffing, incidents | manager sees service operations first | manager workflow tests |
| cashier dashboard | POS terminal exists | no stripped-down cashier workspace shell | cashier shell with register, shift, checkout, receipts | cashier sees only what they need | POS UX tests |
| server handheld dashboard | handheld route exists | no polished server-first shell | handheld-focused server tasks and table actions | keep lightweight and touch-first | handheld tests |
| bartender mode | early POS tab surfaces exist | no distinct high-speed bar UI | condensed tab-first bar mode | optimize for rush-hour speed | bar-mode UX tests |
| kitchen KDS dashboard | kitchen foundations exist | no single distance-readable kitchen shell | large-type KDS and expo surfaces | readability beats dashboard density | visual and realtime tests |
| driver dashboard | routes surfaces exist | no privacy-minimized driver-first shell | delivery task shell with minimal PII | driver sees only operational essentials | driver privacy tests |
| accountant dashboard | reporting and billing exist | no finance-focused shell | finance and export view | finance sees financial truth, not ops clutter | report/export tests |
| marketer dashboard | CRM/growth exist | no growth-first shell | campaigns, segments, attribution shell | growth only for permissioned users | consent and attribution tests |
| implementation dashboard | many setup/readiness surfaces exist | setup still too expert-driven | guided setup, readiness, blockers, runbooks | setup required states are explicit | launch-readiness tests |
| loading states | mixed quality across modules | inconsistent perceived quality | shared skeletons/spinners by surface type | never leave critical surfaces blank | visual tests |
| empty states | uneven adoption across modules | dead-end empty modules still exist | shared actionable empty-state patterns | every primary module needs a CTA | visual + screenshot checks |
| error states | inconsistent across actions/routes | support burden and confusion | shared error boundary copy and retry patterns | state should say whether user can retry, fix setup, or escalate | E2E error-path checks |
| success states | uneven feedback across complex flows | user uncertainty after mutation | standard toast and success panel patterns | success should point to next action | UX tests |
| permission denied states | not standardized | permissions feel arbitrary | common permission-denied components | show why access is blocked without leaking extra info | permission-negative UI tests |
| setup required states | not standardized | admins reach partially configured modules | setup-required cards linked to runbooks | setup states are distinct from permission states | setup-state tests |
| preview feature states | inconsistent today | users can confuse preview with live | preview badge and warning pattern | preview is always explicit | preview-state tests |
| offline states | partial in POS only | degraded mode unclear elsewhere | standardized degraded/offline banners | degraded mode never masquerades as normal | offline/degraded tests |
| degraded mode states | operational tooling exists but UX is uneven | support triage harder than needed | common degraded-state banner and incident links | incident copy is human-readable | smoke + incident UX checks |
| mobile/tablet responsiveness | some routes responsive, some desktop-heavy | role-based field work needs better device fit | responsive patterns per role shell | mobile-first for handheld, kitchen, driver, POS | responsive screenshot tests |
| accessibility | marketing has better coverage than dashboard | dashboard ARIA/keyboard gaps likely | a11y pass on high-traffic operator flows | accessibility is part of DoD | Playwright a11y suites |
| design tokens | component library exists but module growth is uneven | inconsistent spacing, status, and feedback | tokenize status, layout, and feedback primitives | no ad-hoc status color systems | token and visual tests |
| component consistency | multiple module families evolved independently | inconsistent forms/tables/cards | align common shells and interaction patterns | new modules must use shared primitives | visual regression and lint-style checks |

## Execution Order
1. role-based navigation and shell cleanup
2. POS, kitchen, and owner role shells
3. common state system: loading, empty, error, success, denied, setup-required, preview
4. responsive/operator device patterns
5. token and component consistency program
6. dashboard accessibility as a release gate

## Guardrails
- do not expose hidden or placeholder modules just because routes exist
- do not use UI gating as permission enforcement
- do not optimize for maximal navigation breadth over role clarity
