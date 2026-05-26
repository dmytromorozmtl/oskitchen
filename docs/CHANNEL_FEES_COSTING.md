# Channel fees (costing)

KitchenOS **does not** embed Uber Eats / DoorDash / etc. fee schedules.

Operators create `ChannelFeeRule` rows:

- **PERCENTAGE** — % of modeled sale.  
- **FIXED** — currency per item.  
- **MIXED** — % + fixed.

The costing run’s default channel comes from `defaultChannelProvider` in `costingSettingsJson` (e.g. `STOREFRONT`). Additional channels can be modeled in future runs (schema supports `CHANNEL` run type).
