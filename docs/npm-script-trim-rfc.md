# npm Script Trim RFC

**Status:** RFC — **no trim executed** (baseline only)  
**Policy:** `npm-script-trim-v1`  
**Audience:** Platform engineering, DevOps, Founder  
**Baseline (2026-06-01):** **1,064** scripts in `package.json`  
**Related:** [`console-log-sweep-plan.md`](./console-log-sweep-plan.md) · [`fullreport1june.md`](./fullreport1june.md) · [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md)

---

## Problem

KitchenOS `package.json` exposes **1,064 npm scripts** — far above maintainable discovery cost for contributors and CI operators.

| Symptom | Impact |
|---------|--------|
| `npm run` tab-completion unusable | New engineers cannot find `smoke:p0-staging-proof-unblock` among 272 `ops:*` entries |
| Era25 orchestrator sprawl | ~332 era25/ops-linked scripts; many are validate/sync pairs with identical structure |
| `test:ci:*` explosion | **427** cert chains — most gate historical evolution eras, not pilot P0 |
| Duplicate GitHub workflows | Each ops script often has a matching `.github/workflows/ops-*-validate.yml` |
| Console.log debt | ~3,170 CLI `console.log` calls live in scripts targeted by this RFC |

**Honesty rule:** Trimming scripts does **not** replace vault P0 proof or live channel smoke. This RFC reduces **maintainer tax** — not customer-facing capability.

**Do not claim:** “Lean CI surface” until `artifacts/npm-script-trim-summary.json` shows total **&lt; 400** with zero pilot regressions.

---

## Baseline taxonomy (June 2026)

| Prefix | Count | Keep? | Notes |
|--------|------:|-------|-------|
| `test:ci:*` | 427 | **Trim 70%** | Archive era17–era25 cert chains; keep P0 + pilot + security |
| `ops:*` | 272 | **Trim 75%** | Collapse validate/sync/orchestrator triplets |
| `smoke:*` | 63 | **Keep ~40** | P0, pilot, channel, security smokes only |
| `workspace:*` | 53 | Review | Migration-era — keep verify + dry-run |
| `storefront:*` | 44 | Keep | Active GTM / release path |
| `beta:*` | 22 | Keep | Pilot GTM |
| `db:*` / `prisma:*` | 22 | Keep | Standard data ops |
| `staging:*` / `pilot:*` | 29 | Keep | Staging proof |
| `verify:*` / `validate:*` / `cert:*` | 27 | Merge | Single entrypoints |
| Other | ~165 | Review | Ad-hoc — registry or delete |

**Root cause:** Evolution-era governance generated **one npm script per policy artifact** instead of parameterized CLI.

---

## Design principles

1. **Pilot scripts are sacred** — anything in P0/Tier2/pilot runbook stays until post-pilot Month 2 review.
2. **One orchestrator, many policies** — replace `run-*-execution` + `validate-*-integrity` + `sync-*-baseline` triplets with flags.
3. **Archive, don’t delete history** — move superseded scripts to `scripts/ops/_archive/era25/`; remove npm aliases only.
4. **No new scripts without registry** — see § Registry gate below.
5. **CI follows trim** — delete orphan GitHub workflows when npm script removed.

---

## Target end state

| Metric | Now | Phase 1 (pilot) | Phase 2 (post-pilot) |
|--------|-----|-----------------|----------------------|
| Total scripts | 1,064 | **&lt; 650** | **&lt; 350** |
| `ops:*` | 272 | **&lt; 80** | **&lt; 40** |
| `test:ci:*` | 427 | **&lt; 120** | **&lt; 60** |
| `smoke:*` | 63 | **~45** | **~40** |
| Era25-named scripts | ~332 | **&lt; 30** (archive rest) | **0** public aliases |
| Orphan workflows | TBD | **−50%** | **−80%** |

---

## Phase 0 — Inventory artifact (1 day)

Add `scripts/audit-npm-script-surface.ts` → `artifacts/npm-script-trim-baseline.json`:

```json
{
  "generatedAt": "2026-06-01T00:00:00Z",
  "total": 1064,
  "byPrefix": { "test:ci": 427, "ops": 272, "smoke": 63 },
  "pilotCritical": ["smoke:p0-staging-proof-unblock", "ops:run-p0-staging-proof-execution"],
  "era25Count": 332,
  "orphanWorkflows": 0
}
```

Wire: `npm run audit:npm-script-surface`.

**Pass:** Artifact committed; pilot-critical list reviewed against [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md).

---

## Phase 1 — Collapse ops triplets (1–2 weeks)

### Pattern today (× ~80 chains)

```
ops:run-{policy}-execution          → orchestrator
ops:validate-{policy}-integrity     → reads artifacts, exits 1
ops:sync-{policy}-integrity-baseline → writes baseline JSON
test:ci:{policy}:cert               → vitest wrapper calling validate
```

### Replacement: unified ops CLI

```bash
npm run ops -- --policy p0-staging-proof --mode run|validate|sync-baseline
npm run ops -- --policy tier2-golden-path --mode validate
```

Implementation sketch:

| File | Role |
|------|------|
| `scripts/ops/cli.ts` | Commander router: `--policy`, `--mode`, `--execute`, `--write` |
| `scripts/ops/policies/registry.ts` | Maps policy id → runner module |
| `scripts/ops/_archive/era25/` | Frozen legacy runners (no npm alias) |

### Phase 1 delete candidates (npm alias only)

| Category | Example scripts | Action |
|----------|-----------------|--------|
| Era25 terminal seal chain | `ops:validate-era25-*-terminus-*` (40+) | Archive + remove alias |
| Era25 convergence train | `ops:run-*-convergence-post-*-orchestrator-era25` | Archive |
| Duplicate exports | `ops:export-*-checklist` where doc exists | Keep 1 generic export |
| Linear path closed theater | `ops:validate-linear-path-permanently-closed` | Archive post-pilot |

**Keep explicit aliases (Phase 1):**

| Script | Why |
|--------|-----|
| `ops:run-p0-staging-proof-execution` | P0 human gate |
| `ops:run-tier2-staging-proof-execution` | Tier 2 golden path |
| `ops:run-pilot-week1-execution` | Pilot runbook |
| `ops:validate-p0-staging-proof-integrity` | CI gate |
| `ops:run-p0-vault-day0-orchestrator` | Vault day 0 |
| `ops:export-p0-vault-env-template` | Vault one-pager companion |

---

## Phase 2 — Trim `test:ci:*` cert sprawl (1 week)

### Keep (pilot + security)

| Chain | Purpose |
|-------|---------|
| `test:ci:security` | RBAC, webhooks, mutation registry |
| `test:ci:p0-staging-proof*` | P0 artifact gates |
| `test:ci:pilot-gono-go*` | GO/NO-GO evaluator |
| `test:ci:paid-pilot*` | Pilot convergence (single cert, not era25 fan-out) |
| `test:ci:scorecard:cert` | Scorecard honesty |
| `test:ci:forbidden-claims*` | Marketing claims |

### Archive

- All `test:ci:era25-*` chains (**~180 entries**) → one meta-test or archived folder
- Duplicate `test:ci:*-convergence-era25:cert` variants
- Historical era17–era24 `:cert` unless referenced in active CI workflow

**CI rule:** `.github/workflows/ci.yml` (or primary PR workflow) lists **≤ 25** npm scripts explicitly.

---

## Phase 3 — Smoke consolidation (3 days)

| Keep | Merge into |
|------|------------|
| `smoke:p0-staging-proof-unblock` | — |
| `smoke:enterprise-sso-idp-staging` | — |
| `smoke:woo-live` / `smoke:shopify-live` | `smoke:channel-live -- --provider woo\|shopify` |
| `smoke:pilot-gono-go` | — |
| `smoke:pilot-forbidden-claims-enforcement` | — |
| `smoke:competitor-feature-gap-matrix` | — |
| Era25 `smoke:*-era25` duplicates | Delete alias; use generic smoke |

Target: **63 → ~40** smoke scripts.

---

## Phase 4 — Registry gate (ongoing)

Add `config/npm-scripts/registry.json`:

```json
{
  "version": 1,
  "allowedPrefixes": ["smoke", "ops", "test", "db", "storefront", "beta", "pilot", "staging"],
  "requireIssueForNewScript": true,
  "maxTotalScripts": 400,
  "pilotProtected": ["ops:run-p0-staging-proof-execution", "smoke:p0-staging-proof-unblock"]
}
```

CI check `npm run lint:npm-script-registry`:

- Fail if `package.json` script count &gt; `maxTotalScripts`
- Fail if new script not in registry allowlist (diff-based on PR)

**Policy:** No new `ops:validate-era26-*` scripts — extend `ops -- --policy` registry instead.

---

## Workflow cleanup matrix

For each removed npm script:

| Step | Owner |
|------|-------|
| 1. Confirm no `grep -r` references in docs/CI | Eng |
| 2. Archive TS under `scripts/ops/_archive/` | Eng |
| 3. Remove `package.json` entry | Eng |
| 4. Remove matching `.github/workflows/ops-*-validate.yml` if orphaned | DevOps |
| 5. Update `commercial-pilot-runbook.md` command refs | Docs |

Run: `scripts/audit-npm-script-orphans.sh` (proposed) — cross-ref workflows ↔ package.json.

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Break P0 proof chain | `pilotProtected` list + smoke before/after trim PR |
| Docs reference deleted scripts | Grep + redirect table in RFC appendix |
| Founder relies on obscure cert | Export “operator essentials” cheat sheet (≤ 20 commands) |
| CI green but pilot blocked | Trim **does not** remove vault/smoke **execute** paths |

---

## Operator essentials (post-trim cheat sheet)

Commands that must survive all phases:

```bash
# P0 / vault
npm run check-vault-readiness
npm run ops:run-p0-staging-proof-execution -- --execute --write
npm run smoke:p0-staging-proof-unblock

# Tier 2 / pilot
npm run ops:run-tier2-staging-proof-execution -- --execute --write
npm run smoke:pilot-gono-go
npm run smoke:pilot-forbidden-claims-enforcement

# Channels (when vault 11/11)
npm run smoke:woo-live
npm run smoke:shopify-live

# Engineering gates
npm run typecheck
npm run test:ci:security
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
```

Publish as `docs/operator-essential-commands.md` when Phase 1 completes (separate PR).

---

## Verification artifact

`artifacts/npm-script-trim-summary.json`:

```json
{
  "baselineTotal": 1064,
  "currentTotal": 620,
  "opsCount": 78,
  "testCiCount": 115,
  "smokeCount": 42,
  "era25PublicAliases": 28,
  "pilotScriptsIntact": true,
  "orphanWorkflows": 0,
  "pass": false
}
```

**Pass when:** `currentTotal < 650`, `pilotScriptsIntact: true`, `pass: true`.

---

## Timeline

| Phase | Window | DRI | Exit |
|-------|--------|-----|------|
| 0 — Baseline artifact | Week 1 | Platform | JSON committed |
| 1 — Ops CLI + archive era25 | Post-pilot Week 1–2 | Platform | ops &lt; 80 |
| 2 — test:ci trim | Post-pilot Week 3 | Platform | test:ci &lt; 120 |
| 3 — Smoke merge | Post-pilot Week 4 | Platform | smoke ~40 |
| 4 — Registry gate | Ongoing | Platform | CI enforce max 400 |

**Blocked until pilot GO?** No — Phase 0 can ship now. **Phase 1+** waits until P0 staging proof PASS to avoid trim during active ops debugging.

---

## Decision

| Option | Verdict |
|--------|---------|
| A — Delete all era25 scripts immediately | **Rejected** — breaks doc/CI references mid-pilot |
| B — Unified ops CLI + archive + registry gate | **Accepted** |
| C — Leave 1,064 scripts; document only | **Rejected** — discovery cost remains |

---

## References

- Console.log overlap: [`console-log-sweep-plan.md`](./console-log-sweep-plan.md) Phase 2
- P0 scripts: [`vault-one-pager.md`](./vault-one-pager.md)
- Pilot commands: [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md)
- June audit: [`fullreport1june.md`](./fullreport1june.md) § npm scripts 1,064
