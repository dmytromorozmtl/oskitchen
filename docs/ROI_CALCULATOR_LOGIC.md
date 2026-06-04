# ROI calculator logic

**Policy:** `roi-calculator-conservative-mkt25-v1`  
**Sales guide:** [`roi-calculator-conservative.md`](./roi-calculator-conservative.md)  
**Implementation:** [`lib/marketing/roi-calculator-conservative-policy.ts`](../lib/marketing/roi-calculator-conservative-policy.ts) · [`components/marketing/roi-calculator.tsx`](../components/marketing/roi-calculator.tsx)

Inputs:
- weekly orders
- average order value
- manual coordination hours
- hourly admin/kitchen cost
- monthly mistakes/refunds
- expected growth

Conservative assumptions (MKT-25):
- 35% of manual coordination hours can be reduced.
- 40% of packing/refund loss can be reduced.
- Growth value is modeled as an 8% contribution proxy, not revenue guarantee.

Outputs:
- estimated hours saved
- estimated labor value
- estimated mistake reduction value
- recommended plan

Always label as estimate, not guaranteed savings.
