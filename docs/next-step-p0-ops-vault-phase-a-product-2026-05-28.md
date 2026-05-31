# OS Kitchen — Phase A: P0 Ops Vault (human + product surfaces)

**Status:** Product surfaces + integrity guard **IMPLEMENTED** · Human credentials **REQUIRED**  
**Policy:** `era17-p0-staging-proof-unblock-v1` · Inflection `commercial-inflection-readiness-v1`  
**Playbook:** [`docs/p0-ops-vault-execution-playbook-2026-05-28.md`](./p0-ops-vault-execution-playbook-2026-05-28.md)

---

## Product wiring (where operators work)

| Surface | Anchor | What it shows |
|---------|--------|---------------|
| Today | `#today-commercial-inflection` | Pilot vs governance score · registry LIVE honesty |
| Today | Ops vault compact panel | 11 env phases · next phase CTA |
| Integration Health | `#integration-health-commercial-inflection` | Market gate + registry LIVE=0 honesty |
| Integration Health | `#integration-health-p0-trust` | P0 smoke scripts + vault phases |
| Platform ops | `#commercial-inflection-readiness` | Full blocker matrix |
| Platform ops | `#p0-ops-vault-day0` | Day0 orchestrator commands |

Briefing: P0 vault action priority **0** (when blocked). Commercial inflection ranked action appears **after** vault clears (tier2 / GO milestones).

---

## Human sequence (canonical)

```bash
npm run ops:validate-p0-vault-env -- --json
npm run ops:validate-commercial-inflection-readiness -- --json
npm run smoke:p0-staging-proof-unblock -- --checklist-only
# configure 11 secrets → full smoke
npm run ops:run-p0-vault-day0-orchestrator -- --write
npm run ops:run-commercial-inflection-readiness-orchestrator -- --write
```

**Acceptance:** `artifacts/p0-staging-proof-unblock-summary.json` → `p0ProofStatus: proof_passed`  
**Then:** inflection milestone → `p0_staging_proof_blocked` or `tier2_golden_path_blocked`

---

## STOP rules (non-negotiable)

- SKIPPED ≠ PASS in any `artifacts/*.json`
- No external GTM claims until `proof_passed`
- PM/design: no new UX cycles until P0 PASS
- Registry LIVE=0 is honest until engineering smokes PASS

---

## Next step after Phase A PASS

1. `npm run ops:sync-p0-staging-proof-integrity-baseline -- --write` (regression guard)
2. Tier 2 golden path Phase B — [`docs/next-step-tier2-golden-path-phase-b-product-2026-05-28.md`](./next-step-tier2-golden-path-phase-b-product-2026-05-28.md) · playbook [`docs/tier2-staging-golden-path-execution-playbook-2026-05-28.md`](./tier2-staging-golden-path-execution-playbook-2026-05-28.md)
3. Pilot GO/NO-GO smoke with real artifact
4. Master execution train — [`docs/next-step-master-execution-2026-05-28.md`](./next-step-master-execution-2026-05-28.md)

**Following engineering slice (optional):** Launch Wizard Tier 2 panel deep-link convergence · Today briefing telemetry `briefing_click` on inflection CTA.
