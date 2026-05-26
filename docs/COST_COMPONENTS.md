# Cost components

`CostComponent` rows are attached to a `ProfitabilityLine` and carry:

| Type | Meaning |
|------|---------|
| INGREDIENT | Rolled recipe ingredient $ / output unit |
| LABOR | Labor $ / unit |
| PACKAGING | Packaging $ / unit |
| DELIVERY | Per-item delivery estimate |
| PLATFORM_FEE | User-configured channel take |
| PAYMENT_FEE | Card processing estimate |
| OVERHEAD | Optional prime-cost allocation |
| WASTE | Reserved (recipe waste baked into ingredients today) |
| CUSTOM | Future overrides |

**Sources** are short strings (`recipe`, `channel_fee_rule`, `kitchen_settings`, etc.) for operator transparency.

Per-component editing UI is planned; data model supports it today.
