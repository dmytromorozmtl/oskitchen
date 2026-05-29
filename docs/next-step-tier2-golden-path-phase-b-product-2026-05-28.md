# KitchenOS — Phase B: Tier 2 golden path (post-P0 PASS)

**Status:** Product surfaces + integrity guard **IMPLEMENTED** · Human staging execution **REQUIRED**  
**Policy:** `era20-tier2-staging-golden-path-v1` · Integrity `era28-tier2-staging-golden-path-integrity-v1`  
**Playbook:** [`docs/tier2-staging-golden-path-execution-playbook-2026-05-28.md`](./tier2-staging-golden-path-execution-playbook-2026-05-28.md)  
**Prerequisite:** [`docs/next-step-p0-ops-vault-phase-a-product-2026-05-28.md`](./next-step-p0-ops-vault-phase-a-product-2026-05-28.md) → `p0ProofStatus: proof_passed`

---

## Product wiring (where operators work)

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Launch Wizard | Commercial blockers | Tier 2 status rows · integrity FAIL badge |
| Launch Wizard | Tier 2 panel | Manual phases · ops commands incl. integrity validate |
| Integration Health | `#integration-health-tier2-golden-path` | Post-P0 banner · honesty when integrity FAIL |
| Platform ops | `#tier2-golden-path` | Phases panel · post-P0 orchestrator |
| Commercial inflection | `#commercial-inflection-readiness` | STOP `stop_tier2_fake_pass` · tier2 blocker uses integrity |

Briefing: Tier 2 ranked action after P0 PASS (same era21 slice as Integration Health).

---

## Human sequence (canonical)

```bash
npm run ops:validate-p0-staging-proof-integrity -- --json
npm run ops:validate-tier2-staging-golden-path-integrity -- --json
npm run ops:validate-tier2-golden-path-env -- --json
npm run ops:run-tier2-golden-path-post-p0-orchestrator -- --write
# execute Woo → Order Hub → KDS → Packing on staging; set TIER2_* + GitHub URL env
npm run smoke:tier2-staging-golden-path
npm run ops:validate-tier2-staging-golden-path-integrity -- --json
npm run ops:sync-tier2-staging-golden-path-integrity-baseline -- --write
npm run ops:validate-commercial-inflection-readiness -- --json
```

**Acceptance:** `artifacts/tier2-staging-golden-path-summary.json` → `tier2ProofStatus: proof_passed` with `overall: PASSED` and all manual + GitHub steps `PASSED` (recomputed by integrity guard).

**Then:** inflection milestone → `tier2_golden_path_blocked` clears → pilot GO/NO-GO train.

---

## STOP rules (non-negotiable)

- Tier 2 `proof_passed` without P0 `proof_passed` → integrity FAIL
- Hand-edited `proof_passed` while steps SKIPPED → `fake_pass_status_mismatch`
- `proof_passed` with `overall: SKIPPED` → `fake_pass_overall_skipped`
- Baseline regression after real PASS → CI blocks merge on PR

---

## Next step after Phase B PASS

1. Commercial GO closure Phase C — [`docs/next-step-commercial-go-closure-phase-c-product-2026-05-28.md`](./next-step-commercial-go-closure-phase-c-product-2026-05-28.md)
2. `npm run smoke:pilot-gono-go` with real customer evidence + GO integrity baseline
3. Master execution train — [`docs/next-step-master-execution-2026-05-28.md`](./next-step-master-execution-2026-05-28.md)

**Following engineering slice (optional):** PostHog `briefing_click` on Tier 2 / inflection CTAs · commercial inflection report auto-sync on tier2 artifact change.
