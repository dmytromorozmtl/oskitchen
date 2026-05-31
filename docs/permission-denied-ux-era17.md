# Permission denied UX — POS / KDS / dashboard (Era 17)

**Policy:** `era17-permission-denied-ux-v1`  
**Status:** `permission_denied_ux_consistent` — standardized denial cards on pilot surfaces  
**Parent:** [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) · [`pos-tablet-ux-operator-runbook-era17.md`](./pos-tablet-ux-operator-runbook-era17.md)

When an operator lacks RBAC permission, OS Kitchen shows a **permission denied card** — not a blank page or generic 404. This is expected behavior, not a bug.

---

## Standard surfaces (Era 17)

| Surface | Route | Permission | Back link |
|---------|-------|------------|-----------|
| POS terminal | `/dashboard/pos/terminal` | `pos.access` | POS hub |
| POS hub | `/dashboard/pos` | `pos.access` | Dashboard |
| POS layout gate | `/dashboard/pos/*` | `pos.access` | Today |
| Kitchen display | `/dashboard/kitchen` | `kitchen.view` | Today |

Copy source: `lib/ux/permission-denied-copy.ts` · UI: `PermissionDeniedSurfaceCard` + `data-testid="permission-denied-card"`.

---

## Operator guidance

1. **Do not share credentials** — ask workspace owner to grant the missing permission on your staff role.
2. **POS cashier** needs at minimum: `pos.access`, `pos.checkout` (and shift permissions for closeout).
3. **KDS line cook** needs: `kitchen.view`, `kitchen.bump` (recall optional).
4. Denied states are **audited** server-side — UI denial does not weaken RBAC.

---

## Spot check (staging)

1. Log in as a staff user **without** `pos.access` → open `/dashboard/pos/terminal` → see permission denied card with `pos.access` in copy.
2. Same user → `/dashboard/kitchen` may work if `kitchen.view` is granted — test role matrix intentionally.
3. Log in as user **without** `kitchen.view` → `/dashboard/kitchen` → denied card with `kitchen.view` in copy.

Optional attestation: `PERMISSION_DENIED_UX_OPERATOR_EMAIL`.

---

## Limitations

- Settings sub-pages may still use `notFound()` for manage-only routes — not all dashboard denials use the card yet.
- Storefront hub reuses `PosAccessCard` with domain-specific copy.
- No claim of Toast/Square hardware permission UX parity.

---

## Validation

```bash
npm run test:ci:permission-denied-ux-era17:cert
npm run smoke:permission-denied-ux
```

Artifact: `artifacts/permission-denied-ux-summary.json`
