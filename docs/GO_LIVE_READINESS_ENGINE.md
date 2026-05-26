# Readiness engine

## Goal

Produce a deterministic, explainable readiness percent for every
`GoLiveProject` by inspecting actual workspace data. The score reflects
both the breadth (how many checks are satisfied) and the **weight**
(how launch-critical each check is) of the workspace state.

## Inputs

`loadReadinessInputs(userId, projectId)` consolidates a single snapshot:

| Field | Source |
|------|--------|
| `hasBusinessProfile` | `KitchenSettings.businessName` |
| `hasFulfillmentRules` | `KitchenSettings.pickupWindows` / `deliveryEnabled` |
| `hasMenu` | `Menu.findFirst({ userId })` |
| `productCount` | `Product.count({ menu: { userId } })` |
| `mappedProductCount` | `ProductMapping` (`APPROVED`, `CONFIRMED`) |
| `unmappedProductCount` | `ProductMapping` (`UNMAPPED`, `NEEDS_REVIEW`, `CONFLICT`) |
| `customerCount` | `KitchenCustomer.count` |
| `connectionsConnected` | `IntegrationConnection.status === "CONNECTED"` |
| `connectionsBroken` | `IntegrationConnection.status` in `ERROR` / `NEEDS_AUTH` |
| `testOrderCount` | `Order.count` |
| `productionRuns` | `ProductionBatch.count` |
| `packingTaskCount` | `PackingTask.count` |
| `packingValidatedCount` | `PackingVerificationSession.count` |
| `labelsPrinted` | `PrintedLabel.count` |
| `deliveryRoutes` | `DeliveryRoute.count` |
| `staffActive` | `StaffMember.count({ active: true })` |
| `trainingCompletions` | placeholder until the training model exists |
| `hasBilling` | `Subscription.stripeCustomerId` or status `TRIALING` |
| `hasBackup` | currently `false`; will read from a future `DataExport` model |
| `hasAnalytics` | `UsageEvent.count > 0` |
| `storefrontPublished` | `StorefrontDomain` OR `StorefrontMenuPublish` |
| `webhooksHealthy` | `connectionsBroken === 0` |
| `approvalsCount` | `GoLiveApproval.count` for the project |
| `approvalsRequired` | configured in `REQUIRED_APPROVALS` |

## Signals

`buildReadinessSignals` converts the snapshot into 22+ named signals
with the shape:

```
{ key, label, stage, value, satisfied, required, weight, actionRoute, reason }
```

Each signal belongs to a category (see `CATEGORY_OF_SIGNAL`).

## Weighting

The base weight is multiplied by a **business-type multiplier**:

| Business type | Boosted categories |
|---------------|--------------------|
| MEAL_PREP | packing ×2, routes ×2, labels ×2, production ×1.5 |
| CATERING | production ×1.5, billing ×1.5, routes ×1.5 |
| GHOST_KITCHEN | integrations ×2, mapping ×2, brand ×1.5 |
| CLOUD_KITCHEN | integrations ×2, mapping ×2 |
| MULTI_BRAND | integrations ×1.5, mapping ×1.5, brand ×2 |
| BAKERY | production ×1.5, packing ×1.5 |
| RESTAURANT | kitchen ×1.5, storefront ×1.2 |
| CAFE | storefront ×1.2 |
| BAR | staffing ×1.5, kitchen ×1.2 |
| OTHER | none |

## Scoring formula

```
score = round( achievedWeight / totalWeight * 100 )
```

`totalWeight` and `achievedWeight` are computed by walking the signals
and summing `weight × businessMultiplier` (achieved counts only when
`satisfied === true`).

The output also returns:

- `required.satisfied` and `required.missing` (hard launch requirements)
- `byCategory` breakdown for the UI
- the full `signals` array for explanation surfaces

## Determinism guarantees

- Same snapshot → same score.
- Adding a new signal never decreases the score of a workspace where
  that signal was previously implicitly satisfied; signals are
  additive with explicit weights.
- No randomness, no time-of-day branches, no network calls.

## Refresh lifecycle

`refreshAutoValidation` runs after every create, checklist update,
approval, and status transition. It:

1. Reads the snapshot.
2. Updates each `autoValidated` checklist row to DONE / TODO / BLOCKED.
3. Re-runs the validator to compute readiness, risk, and recommended
   status, then writes them back to `GoLiveProject`.
4. Records a `AUTO_VALIDATION` event in `GoLiveProjectEvent`.
