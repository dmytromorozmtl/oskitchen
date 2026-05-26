# Duplicate and update strategy

## Import modes (target)

- Create only  
- Update existing  
- Upsert  
- Skip duplicates  
- Review duplicates manually  

## Matching keys (by entity)

| Entity | Primary keys / fallbacks |
|--------|-------------------------|
| Menu item | SKU, external ID, title + menu (warn) |
| Customer | Email, external ID |
| Ingredient | Name + unit, supplier SKU |
| Supplier | Name + email |
| Order | External order id, guest email + timestamp (careful) |

## Principles

- Never overwrite production fields silently — preview shows old vs new where updates are proposed.
- Duplicate detection feeds `duplicateRows` and row-level `DUPLICATE` status.
- Execution layer (future) respects selected mode per job in `settingsJson`.
