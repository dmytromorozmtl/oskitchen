# Golden Demo Scenarios

Six repeatable stories for **sales**, **CS**, and **QA**. Each should complete in **≤15 minutes** with a single narrator.

## 1. Meal prep weekly operations

**Preset:** `/demo/meal-prep` → business type `MEAL_PREP`.  
**Flow:** weekly menu → preorder → production → packing labels → route → CRM → analytics → ingredient demand.  
**Success criteria:** Order shows blockers clearing as mapping + dates satisfied; Today shows prep/pack/route cards.

## 2. Café POS counter sale

**Preset:** `/demo/cafe`.  
**Flow:** POS sale → receipt → kitchen routing → ready-now SKUs → customer lookup → analytics.  
**Success criteria:** No false pickup-date blocker for walk-in; `POSTransaction` present; receipt path visible.

## 3. Bakery preorder pickup

**Preset:** `/demo/bakery`.  
**Flow:** preorder → batch production → allergen label → pickup window → packing verification.  
**Success criteria:** Nav reads **Preorders & pickup**; packing verify reachable.

## 4. Catering event

**Preset:** `/demo/catering`.  
**Flow:** quote → approval → event order → production plan → loadout → follow-up.  
**Success criteria:** Catering quotes + calendar + production visible; nav reads **Events & orders**.

## 5. Ghost kitchen channel operations

**Preset:** `/demo/ghost-kitchen`.  
**Flow:** sample channel order → mapping issue → approval → production → packing → analytics.  
**Success criteria:** Order hub + mapping + integration health show honest statuses; nav reads **Channel orders**.

## 6. Multi-brand / commissary

**Preset:** ghost-kitchen or multi-brand workspace; emphasize **two brands** in narration.  
**Flow:** two brands → shared kitchen → brand/location filters → production workload → executive.  
**Success criteria:** Brand switcher changes visible queues without cross-brand leakage.

## Implementation pointers

- Public hub: `/demo` (import is confirm-gated, demo mode banner).  
- In-app checklist: `/dashboard/demo/scenarios`.  
- Platform index: `/platform/demo`.  
- Narrative doc only — seed expansion continues in `services/demo-data.ts` / import actions without silent production pollution.
