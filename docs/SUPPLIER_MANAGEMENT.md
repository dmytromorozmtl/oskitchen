# Supplier management

- **List / create:** `/dashboard/purchasing/suppliers`
- **Schema:** `Supplier` (contact, JSON address/categories/delivery days, MOQ, lead time, notes, `active`).
- **Items:** `SupplierItem` links `ingredientId` to purchase unit, pack size, unit cost — UI for items is a follow-up (use Prisma Studio or API).

Ingredient legacy `supplier` string still powers demand rollups until items/catalog are fully populated.
