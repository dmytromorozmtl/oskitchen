# Brand templates

**Route:** `/dashboard/brands/templates`

Eight templates align to common FoodOps patterns:

1. Restaurant concept  
2. Café concept  
3. Bar & events brand  
4. Bakery preorder brand  
5. Catering brand  
6. Meal prep brand  
7. Ghost kitchen virtual brand  
8. Cloud kitchen delivery brand  

Each **Use template** link opens `/dashboard/brands/new?template=<key>` where `<key>` matches `BrandTemplateKey` in `lib/brands/brand-template-defaults.ts`.

Defaults include `conceptKind`, optional `defaultBusinessMode`, `menuStrategy` (`MenuStrategy` enum), `storefrontTemplate` string, and a starter description hint.

Post-creation customization is expected; templates never auto-migrate existing menus or orders.
