# Meal Plans module audit (KitchenOS)

**Date:** 2026-05-11
**Scope:** `/dashboard/meal-subscriptions`, `actions/customer-subscription.ts`,
`CustomerSubscription` model, related downstream surfaces (orders, CRM,
weekly menus, production, packing, routes).

## TL;DR

The module is a single-form capture page backed by a thin model
(`CustomerSubscription`). It does not generate orders, has no cycle history,
no selections, no allergy/dietary integration with operations, no templates,
no reports, and no business-mode adaptation.

The plan: keep the existing `/dashboard/meal-subscriptions` route alive
(soft-deprecated, linked to the new center) and ship a real Command Center
at `/dashboard/meal-plans` with cycles, draft order generation, CRM hooks,
templates, and reports. All changes are **additive**.

## Findings

| #  | Area | Current state | Limitation | Affected workflows | Recommended fix | Pri |
|----|------|----------------|------------|---------------------|-----------------|-----|
| 1  | Page model | `/dashboard/meal-subscriptions` is a single-form capture | No KPIs, no list filters, no detail page, no cycles, no templates, no reports | All | New Command Center at `/dashboard/meal-plans` with 10 tabs (overview / active / cycles / needs-review / customers / templates / generated / paused / reports / settings) | P1 |
| 2  | Data model | `CustomerSubscription` has `planName / frequency / mealsPerWeek / pickupOrDelivery / status / nextOrderDate / notes` only | No type, no cycle history, no selections, no end date, no pause-until, no allergies/dietary on the plan, no brand/location, no template, no billing mode | All | New additive `MealPlan` + `MealPlanCycle` + `MealPlanSelection` + `MealPlanEvent` + `MealPlanTemplate` models; preserve `CustomerSubscription` unchanged | P0 |
| 3  | Order generation | None | Manual operators must rebuild the order from scratch every cycle | Meal prep, catering, café, bakery | New `services/meal-plans/meal-plan-order-generator.ts` — preview → draft order, never auto-confirm, never auto-charge | P0 |
| 4  | Cycle history | None | No way to see past or upcoming cycles | All | `MealPlanCycle` with UPCOMING / NEEDS_SELECTION / READY_TO_GENERATE / GENERATED / SKIPPED / PAUSED / CANCELLED | P0 |
| 5  | Selections | None | Selecting recurring meals each cycle is a manual side workflow | Meal prep, café | `MealPlanSelection` linking cycle ↔ menu / product, with `locked` flag for favorites | P1 |
| 6  | Allergies / dietary | Plan has a single `notes` text field | Kitchen / packing don't get structured info | Meal prep, catering, bakery | Structured JSON fields on `MealPlan` (`allergiesJson`, `dietaryPreferencesJson`, `dislikedItemsJson`, `favoriteItemsJson`); inherited from CRM if missing | P0 |
| 7  | CRM linkage | Plan stores `customerId` (KitchenCustomer) but no timeline writeback | CRM profile cannot show plan activity | All | Append `CustomerTimelineEvent (source_type='meal_plan')` on create / pause / cancel / generate | P1 |
| 8  | Brand / location | Not modelled | Multi-brand and multi-location operators cannot scope plans | Multi-brand, multi-location, ghost / cloud kitchen | Optional `brandId`, `locationId` on `MealPlan`, plus default fallback | P1 |
| 9  | Frequency | WEEKLY / BIWEEKLY / MONTHLY only | Cannot model semi-monthly, fortnightly, custom rrules | Catering, corporate | Add `MealPlanFrequency` (with CUSTOM_RRULE) and a small recurrence helper | P2 |
| 10 | Fulfillment | PICKUP / DELIVERY only | Mixed (some pickup some delivery) common for corporate | Catering, café, corporate | `MealPlanFulfillmentMode` PICKUP / DELIVERY / MIXED; per-cycle override allowed via selections | P2 |
| 11 | Pause workflows | Status flips only | No "pause until <date>", no pause reason, no resume rules | All | `pausedUntil`, `pauseReason`, and resume action that recomputes next order date | P1 |
| 12 | End date | Not modelled | Plans run forever in the UI | All | Optional `endDate` + `EXPIRED` status when reached | P2 |
| 13 | Generation mode | Implicit (manual) | Operators can't choose preview vs draft vs auto | Meal prep at scale | `MealPlanGenerationMode` MANUAL_ONLY / PREVIEW_BEFORE_CREATE / AUTO_CREATE_DRAFT_ORDERS. `AUTO_CREATE_CONFIRMED_ORDERS` reserved and disabled in the UI | P1 |
| 14 | Billing | Not modelled | No way to express "pay later", "manual invoice", "Stripe placeholder", "free trial" | All | `MealPlanBillingMode` enum + optional `pricePerCycle` / `currency` — placeholder only, no auto-charge | P1 |
| 15 | Templates | None | Operators rebuild the same plan again and again | Meal prep, catering, café, bakery | `MealPlanTemplate` (preset items, dietary preset, defaults) + 8 built-in templates | P1 |
| 16 | Reports | None | No view of recurring revenue, churn, generation health | All | `/dashboard/meal-plans/reports` — active / paused / churn / cycles generated / meals due / pickup vs delivery / top meals (deferred for v2) | P1 |
| 17 | Empty state | "No subscriptions yet" only | Lacks call-to-action variety | All | Per-tab empty states matching the spec | P2 |
| 18 | Permissions | None | Same as the rest of the app today | All | `lib/meal-plans/meal-plan-permissions.ts` (mirror of CRM permissions); kitchen / driver get scoped reads | P1 |
| 19 | Storefront request | None | Customer cannot request a plan from the storefront | Future | Placeholder note in docs; no live route yet | P3 |
| 20 | Today Board | No surface | Operators don't see plan cycles due today | Meal prep, café | Document the hook; the Today Board read can be wired in a follow-up | P2 |
| 21 | Business-mode terminology | Hard-coded "Meal subscriptions" | Catering / café / restaurant should see different copy | All | `mealPlanTerminologyForMode` helper, mirror of CRM | P2 |
| 22 | Duplicate generation | Not guarded | Risk: regenerating a cycle could create two orders | Meal prep | Strict guard: a cycle keeps `orderId` once generated and refuses re-generation unless explicitly reset | P0 |
| 23 | Existing form | Writes only to `CustomerSubscription` | New center wouldn't show legacy plans | All | Backfill helper: when the new center loads, mirror any `CustomerSubscription` without a paired `MealPlan` into a `MealPlan` row | P1 |

## Priority legend

- **P0** — Data correctness / order safety / duplicate prevention / structured allergy access
- **P1** — High meal-plan value (cycles, templates, generation, CRM linkage)
- **P2** — Polish (frequency, fulfillment, terminology, reports breakdowns)
- **P3** — Roadmap (storefront request, customer portal, recurring billing)
