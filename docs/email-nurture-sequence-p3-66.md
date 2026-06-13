# Email nurture sequence (P3-66)

**Policy:** `email-nurture-sequence-p3-66-v1`  
**Department:** Marketing  
**Upstream:** `email-nurture-5-sequence-mkt19-v1`  
**Registry:** [`artifacts/email-nurture-sequence-p3-66-registry.json`](../artifacts/email-nurture-sequence-p3-66-registry.json)

---

## Five-email inbound sequence

| # | Day | Theme |
|---|-----|-------|
| 1 | 0 | Welcome + honest scope |
| 2 | +2 | Today Command Center |
| 3 | +5 | Integration Health moat |
| 4 | +9 | AI modules (qualified) |
| 5 | +14 | Design partner invite |

Full copy, tokens, triggers, and forbidden claims:

**[`docs/email-nurture-5-sequence.md`](./email-nurture-5-sequence.md)**

Post-nurture outbound handoff:

**[`docs/design-partner-email-sequence.md`](./design-partner-email-sequence.md)**

---

## Verify

```bash
npm run check:email-nurture-sequence-p3-66
npm run audit:email-nurture-sequence-p3-66
npm run test:ci:email-nurture-sequence:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`

---

## Status

Ready to wire in CRM/automation — **0 sequences delivered at scale**. Run `lintEmailNurture5SequenceCopy()` before template changes.
