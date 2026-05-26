# POS — Billing & Entitlements

Feature keys (`lib/plans/feature-registry.ts`):

| Key | Min plan (default) | Usage |
| --- | --- | --- |
| `pos_terminal` | PRO | Gate checkout + `/dashboard/pos` shell. |
| `pos_registers` | PRO | Reserved for multi-register limits (register create currently also checks `pos_terminal`). |
| `pos_receipts` | PRO | Reserved for advanced receipt channels. |
| `pos_shifts` | TEAM | Open/close shift server actions. |
| `pos_reports` | TEAM | `/dashboard/pos/reports` aggregates. |
| `pos_multi_location` | ENTERPRISE | Future cross-location dashboards. |
| `pos_hardware_settings` | TEAM | Aligns with hardware admin surfaces. |

`canUseFeature` respects billing access, plan rank, trial state, billing bypass dev flag, and **superadmin** allow-list (founder email path unchanged).

## Module toggle

`pos_terminal` exists in `MODULE_REGISTRY_ENTRIES` with `requiredFeature: "pos_terminal"` metadata. `KitchenModulePreference` rows disable `/dashboard/pos` subtree when `enabled = false`.

## Marketing alignment

Public `/product/pos-terminal` explains honest scope (not a full legacy POS replacement for every concept).
