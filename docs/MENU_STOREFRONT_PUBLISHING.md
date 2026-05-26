# Menu storefront publishing

- **Checkout menu:** `StorefrontSettings.activeMenuId` — unchanged; toggling **Checkout menu** on a row sets the active menu transactionally (same as before).  
- **Snapshots:** `StorefrontMenuPublish` with `snapshotJson` — use for immutable public views; deeper wiring is a follow-up.  
- **Strategy copy:** `menu-publishing.ts#describeStorefrontLink` surfaces whether a menu is the active checkout menu and whether the storefront is disabled.

Alcohol / delivery: never claim capabilities the workspace has not configured.
