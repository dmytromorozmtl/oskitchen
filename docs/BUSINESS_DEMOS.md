# Business-specific demos

**Hub:** `/demo`  
**Vertical pages:** `/demo/[slug]` where `slug` ∈ `DEMO_VERTICAL_SLUGS` in `lib/demo-verticals.ts`.

## Verticals

| Slug | Brand name | Business type |
| --- | --- | --- |
| `meal-prep` | FitFresh Meals | `MEAL_PREP` |
| `catering` | OfficeBite Catering | `CATERING` |
| `ghost-kitchen` | CloudKitchen Express | `GHOST_KITCHEN` |
| `bakery` | SweetDrop Bakery | `BAKERY` |
| `restaurant` | Bistro Verde | `RESTAURANT` |
| `cafe` | CornerCup Café | `CAFE` |
| `bar` | NorthBar Lounge | `BAR` |

Import uses `seedDemoWorkspace` in `services/demo-data.ts` (simulated integrations, no live API keys).
