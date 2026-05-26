# Advanced product audit — KitchenOS

Objective: move from “order dashboard” to **premium vertical ops** (planning, margin, fulfillment, B2B, optional AI) without breaking existing channels.

## What is currently basic

- **Menus/products:** strong for weekly listing, light on **planning** (no calendar, templates, per-channel windows, sold-out caps).
- **Orders:** solid manual + channel hub; no **public owned storefront**; limited **B2B quote** flow.
- **Production/packing:** checkpoint model; light **verification / scan audit** and **allergen guardrails**.
- **Inventory:** “lite” — no **ingredient-level demand** or **purchasing** loop.
- **Analytics:** good snapshot; no **forecast**, **margin engine**, or **ops calendar** unification.
- **Staff:** role on profile only; no **task board** or **workload**.
- **Multi-location:** single-tenant single site assumption.

## What is missing for real food operations

- Owned **preorder channel** (not only Woo/Shopify).
- **Recipe + cost + margin** truth tied to menu items.
- **Demand → shop list** from real or forecasted volume.
- **Route manifest** for internal delivery.
- **Label/nutrition** as operator-owned data with legal disclaimer.
- **Catering** pipeline (quote → order).
- **Subscriptions** for meal-prep / recurring B2B.
- **One calendar** for deadlines, prep, routes, tasks.

## Feature ranking

| Feature | Customer value | Impl. complexity | Revenue impact | Demo impact | Risk | Priority |
|---------|----------------|------------------|----------------|-------------|------|----------|
| Public preorder storefront | Very high | Medium | High (new channel) | Very high | Med (ops + abuse) | **P0** |
| Weekly menu planner + availability | Very high | Medium–high | High | High | Low | **P0** |
| Recipe costing & margin | Very high | Medium | High (upsell) | High | Med (data quality) | **P1** |
| Ingredient demand + purchasing | High | Medium | Med | High | Low | **P1** |
| AI production forecast (honest) | High | Low–med | Med | High | Med (expectations) | **P1** |
| Delivery route planning | Med–high | Medium | Med | Med | Low (no Maps ok) | **P1** |
| Packing verification / QR | High | Medium | Med | High | Low | **P1** |
| Nutrition / allergen label builder | Med | Medium | Med | Med | **High** if compliance claimed | **P1** (disclaimer-led) |
| Staff task management | Med | Medium | Med | Med | Low | **P1** |
| Multi-location foundation | High long-term | High | High (enterprise) | Med | High if rushed | **P2** |
| Customer meal subscriptions | High niche | Medium | Med | High | Med | **P1** |
| B2B catering quotes | High (catering) | Medium | High | High | Low | **P1** |
| Operations calendar | High | Medium | Med | High | Low | **P1** |
| AI ops copilot | Med | Medium | Med | Very high | Med (privacy) | **P2** |
| Advanced notification rules | Med | Medium | Low | Low | Low | **P2** |
| Command center home | High | Low–med | Med | High | Low | **P1** |
| Global search / command palette | Med | Medium | Low | Med | Low | **P2** |
| Import/export center | Med | Medium | Low | Med | Low | **P2** |

### Priority legend

- **P0:** must-have for a **sellable “owns the preorder”** story.
- **P1:** strong differentiation vs generic dashboards.
- **P2:** enterprise / depth / AI polish — ship after core margin + storefront stable.
- **P3:** future (API, multi-brand tenant, deep ML, routing optimization).

## MVP-safe slice (recommended rollout)

1. **Storefront + internal order** (pay-later / request mode).
2. **Menu planner shell** + `ProductAvailability` data model.
3. **Costing** MVP: recipe + ingredients + margin % + warnings.
4. **Deterministic forecast** + optional OpenAI copy layer.
5. **Routes, packing events, nutrition profiles** with clear “placeholder / manual” modes.
6. **Tasks, catering quotes, subscriptions, calendar** with CRUD-lite UIs.
7. **Copilot** deterministic-first; OpenAI optional.

## Deferred (explicit)

- Fully automated nutrition regulatory compliance.
- GPS route optimization without Maps contract.
- Deep ML demand models.
- Full multi-location inventory transfers (needs careful migrations).

See **`docs/ADVANCED_READY_REPORT.md`** after implementation for what shipped vs placeholder.
