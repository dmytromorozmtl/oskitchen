# Commission comparison calculator — ChowNow parity (P2-46)

**Policy:** `commission-comparison-calculator-p2-46-v1`  
**Department:** Marketing  
**Registry:** [`artifacts/commission-comparison-calculator-p2-46-registry.json`](../artifacts/commission-comparison-calculator-p2-46-registry.json)

---

## ChowNow parity scope

Headline compare: **DoorDash 30%** marketplace commission vs **owned 0%** marketplace commission (payment processing only).

| Step | UI | Logic |
|------|-----|-------|
| **Enter delivery volume** | Monthly orders · AOV · DoorDash mix | User inputs |
| **Compare DoorDash 30%** | DoorDash commission card | `doordashCommissionRatePct = 30` |
| **Compare owned 0% marketplace** | Owned fees card | `ownedMarketplaceRatePct = 0` + processing % |
| **Annual savings delta** | Savings card | `monthlySavings × 12` |

> **ChowNow parity** — directional DoorDash 30% vs owned 0% marketplace pitch. **Not guaranteed** savings — **verify** every channel against your **settlement statement**.

---

## Routes

- **Public calculator:** [`/commission-comparison`](/commission-comparison)
- **Dashboard hub:** [`/dashboard/marketing/commission-comparison`](/dashboard/marketing/commission-comparison)

---

## Audit

```bash
npm run audit:commission-comparison-calculator-p2-46
npm run check:commission-comparison-calculator-p2-46
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` — Commission comparison calculator P2-46 audit step.
