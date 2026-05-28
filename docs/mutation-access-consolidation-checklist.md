# Mutation access consolidation — audit checklist

**Policy:** `era14-mutation-access-consolidation-recert-v1` (`lib/permissions/mutation-access-era14-policy.ts`)

**Extends:** `era4-mutation-access-consolidation-v1`, `era11-mutation-access-recert-v1`, `era9-rbac-wave4-recert-v1`

**Posture:** Canonical server mutations flow through `requireMutationPermission` or a **registry** domain helper that wraps it. No mass helper rewrite in Era 14 — documentation + automated recert only.

## Certified today

| Layer | What is proven | Evidence |
|-------|----------------|----------|
| Core adapter | `requireMutationPermission` + legacy fallback containment | `lib/permissions/mutation-access.ts` |
| Domain registry | Helper inventory, wave-4 surfaces, documented exceptions | `lib/permissions/domain-mutation-registry.ts` |
| Denial audit | Shared `logDomainMutationDenied` on wave-4 canonical helpers | `lib/permissions/log-domain-mutation-denied.ts` |
| Wave-4 actions | Negative RBAC matrices in security-db job | `test:ci:rbac-wave4` + `era9-rbac-wave4-recert-v1` |
| Era 14 recert | Registry delegation + scoped-helper honesty | `test:ci:mutation-access-era14:cert` |

## Scoped helpers (outside registry by design)

These modules gate access but are **not** rows in `DOMAIN_MUTATION_HELPERS` — see `MUTATION_ACCESS_ERA14_SCOPED_ACCESS_HELPERS` in the Era 14 policy:

- Order create spine (`lib/orders/order-create-access.ts`)
- Platform support triage bridge (`lib/support/require-support-mutation-access.ts`)
- Import center actor, global search read actor, growth manage gate

Adding a new reusable mutation helper? Prefer a registry row + cert update over ad-hoc duplication.

## Not certified (honest gaps)

| Claim | Status |
|-------|--------|
| Single file contains all authorization logic | **False** — POS, staff, training, and platform bridges remain module-specific |
| Copilot uses one PermissionKey | **Exception** — capability matrix (`copilot_capability_matrix`) |
| All helpers merged into one module | **Out of scope** — Era 14 recert only; no rewrite |
| UI gating replaces server checks | **Forbidden** — UI mirrors `resolve-ui-permissions` only |

## Automated certification smoke (local / pre-release)

```bash
npm run smoke:mutation-access
```

Runs `test:ci:mutation-access-consolidation:cert` (era4 + era11 + era14 recert). Does **not** replace `test:security` wave-4 negative suites.

## Manual RBAC / security review checklist

1. New `actions/*` mutations call a registry helper or `requireMutationPermission` with a canonical key.
2. Sensitive denials on wave-4 surfaces use `logDomainMutationDenied` where the registry marks `auditsDenials: true`.
3. Do not ship tenant-only `requireTenantActor` guards on wave-4 backlog surfaces without era sign-off.
4. Run `npm run test:ci:rbac-wave4` when touching delivery, demo, copilot, feedback, integrations menu sync, production calendar, holiday packages, restaurant tables, or CRM subscription flows.
5. Reference `docs/rbac-permission-architecture.md` §2a before investor/security questionnaire answers.

## CI certification

- `npm run test:ci:mutation-access-era14:cert` (chained in `test:ci:mutation-access-consolidation:cert`)
- Governance: `test:ci:governance-bundles:partition-platform`
