# Menu templates

**Route:** `/dashboard/menus/templates`  
**Code:** `lib/menus/menu-templates.ts`, `actions/menus.ts#applyMenuTemplate`

Templates seed: title, description, `MenuStrategy`, default date window via `suggestDefaultDatesForStrategy`, and optional JSON hints (`availabilityJson`, `fulfillmentRulesJson`, `displaySettingsJson`).

IDs: `meal_prep_weekly`, `restaurant_lunch_dinner`, `cafe_daily_specials`, `bar_drinks_happy_hour`, `bakery_weekend_preorder`, `catering_corporate_lunch`, `catering_event_packages`, `ghost_brand_menu`.

Applying a template runs a server action and **redirects** to `/dashboard/menus`. Plan limits still apply (`maxMenus` on Starter).
