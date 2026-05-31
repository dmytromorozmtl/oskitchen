# OS Kitchen stabilization audit

Full-product review oriented toward **beta readiness** (UX cohesion, safety, testability). Findings are grouped by theme and prioritized **P0–P3**.

---

## Broken or risky flows

| ID | Area | Finding | Priority |
|----|------|---------|----------|
| F1 | Multi-step flows | Several advanced modules (catering multi-line, subscription → auto-order, notification rules → dispatch) are **partial**; users can reach dead ends without guidance to the next manual step. | P1 |
| F2 | Forms + server actions | Many mutations use Zod but **success/error feedback is silent** (void form wrappers); operators cannot tell if save failed without checking data. | P1 |
| F3 | Packing verify | Lookup relies on pasted tokens; **no inline error toast** on failed mutations beyond server round-trip. | P2 |
| F4 | Demo / seed | `SEED_RESET` clears orders/menus for the target user; risk is mitigated by env flag but **not surfaced in UI** — operators must read docs. | P2 |

---

## Inconsistent UI

| ID | Finding | Priority |
|----|---------|----------|
| U1 | Page titles use mixed patterns (`text-3xl` vs cards-first); no shared **PageHeader / PageShell** until stabilization pass. | P2 |
| U2 | Tables vs cards vary by route; filter/search patterns not standardized. | P2 |
| U3 | Icon duplication historically (e.g. calendar icons); sidebar grouping was a flat list — **IA pass** applied via grouped nav. | P2 |

---

## Missing validation

| ID | Finding | Priority |
|----|---------|----------|
| V1 | Some API routes rely on query params without shared Zod schemas; risk varies by route. | P1 |
| V2 | Numeric/date fields on older forms may lack **min/max** or coherent error copy. | P2 |

---

## Missing empty / loading / error states

| ID | Finding | Priority |
|----|---------|----------|
| E1 | Many dashboard routes render minimal empty paragraphs; **no shared EmptyState CTA** pattern consistently. | P2 |
| E2 | Not every route defines **`loading.tsx`**; perceived latency on heavy queries without skeletons. | P2 |
| E3 | Permission denied often redirects generically; dedicated **ErrorState** for forbidden is sparse. | P3 |

---

## Duplicated code

| ID | Finding | Priority |
|----|---------|----------|
| D1 | Repeated “card + title + description” blocks across modules → consolidate via **PageHeader**, **MetricCard**, **EmptyState**. | P3 |
| D2 | Form action wrappers (`*FormAction`) repeat `void (await …)` pattern — acceptable; could centralize via **`safe-action`** helper later. | P3 |

---

## Slow queries / performance

| ID | Finding | Priority |
|----|---------|----------|
| P1 | Several lists use large `take` without pagination (orders, products on busy accounts). | P1 |
| P2 | Some pages `include` nested relations broadly; optimize **`select`** per view when profiling shows hotspots. | P2 |
| P3 | Charts / PDF paths should stay **dynamic-import** where not already (see Performance review). | P2 |

---

## Unsafe secrets

| ID | Finding | Priority |
|----|---------|----------|
| S1 | **No secret values** should appear in client bundles; server env via `getServerEnv` / server-only modules — continue auditing new routes. | P0 |
| S2 | Webhooks must keep signature verification; maintain when adding endpoints. | P0 |

---

## Unclear naming

| ID | Finding | Priority |
|----|---------|----------|
| N1 | “Inventory” vs “Ingredient demand” vs “Purchasing” — related but distinct; **nav grouping** clarifies ops vs inventory-lite. | P2 |
| N2 | “Notifications” vs “Alert rules” — paired under Admin in IA. | P3 |

---

## Demo / simulated integrations

| ID | Finding | Priority |
|----|---------|----------|
| M1 | Demo mode and integration test flows must stay **explicitly labeled** (banner + copy); never imply live sync when disconnected. | P1 |
| M2 | Seed script describes one primary demo tenant; **multi-brand demo fixtures** are incremental (see `services/demo-data.ts` roadmap). | P2 |

---

## External services without graceful fallback

| ID | Finding | Priority |
|----|---------|----------|
| X1 | OpenAI / Google Maps / Resend / Stripe remain **optional** with deterministic fallbacks where implemented — extend pattern to new features. | P2 |
| X2 | Maps links fall back to consumer Google URLs — acceptable; document in ROUTE_PLANNING. | P3 |

---

## Recommended sequencing

1. **P0**: Secret hygiene + webhook verification regressions (ongoing).
2. **P1**: Shared action result shape, user-visible feedback on mutations, pagination on hot lists.
3. **P2**: Design system adoption, `loading.tsx`, empty states, performance selects.
4. **P3**: Drawer/table consolidation, copy polish, deep accessibility sweep.

This audit should be refreshed **each release** (see `docs/RELEASE_PROCESS.md`).
