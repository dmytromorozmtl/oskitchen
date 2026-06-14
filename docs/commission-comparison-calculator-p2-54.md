# Commission comparison calculator (P2-54)

**Policy:** `commission-comparison-calculator-p2-54-v1`  
**Route:** `/commission-comparison`  
**Panel:** `components/marketing/commission-comparison-doordash-uber-panel.tsx`

Gap P2-54 makes `/commission-comparison` fully interactive: enter delivery volume → see savings vs DoorDash and Uber Eats vs owned channel.

## Interactive flow

| Step | Input | Output |
|------|-------|--------|
| `enter_delivery_volume` | Monthly orders, AOV, channel mix | Normalized gross volume |
| `compare_doordash_commission` | DoorDash mix % | Directional 30% commission + savings |
| `compare_uber_eats_commission` | Uber Eats mix % | Directional 25% commission + savings |
| `combined_savings_vs_owned` | Processing % | Combined monthly + annual delta |

Built on P2-46 ChowNow parity (DoorDash 30%) and delivery-commissions dashboard benchmarks (Uber Eats 25%).

## CI wiring check

```bash
npm run check:commission-comparison-calculator-p2-54
```

## Artifact

`artifacts/commission-comparison-calculator-p2-54.json`
