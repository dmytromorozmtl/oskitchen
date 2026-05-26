# Storefront business templates

**Goal:** Map each `BusinessType` to a storefront preset (sections, ordering mode, inquiry forms, fulfillment defaults, SEO placeholders, theme hints).

## Implementation direction

- Store `storefrontTemplateId` (string enum) on kitchen settings or dedicated JSON column.
- Admin UI: choose template → preview (`/dashboard/storefront/preview`) → apply → reset.
- Templates are **configuration**, not new rendering engines — reuse existing storefront builder blocks.

## Template list (product names)

1. Restaurant website  
2. Café website  
3. Bar website  
4. Bakery preorder website  
5. Catering inquiry website  
6. Meal prep weekly menu website  
7. Ghost / multi-brand kitchen website  

Copy and legal disclaimers must stay honest (age-gated products, liquor laws, etc.).
