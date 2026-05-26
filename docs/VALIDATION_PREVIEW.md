# Validation preview

## Outputs

Per job summary (counts):

- Total rows  
- Valid / warning / error  
- Duplicates  
- Create / update / skip  

## Row table

- Row number  
- Suggested action (`ImportPreviewRowAction`)  
- Status (`ImportPreviewRowStatus`)  
- Errors / warnings JSON  
- Normalized preview JSON  

## UI surfaces

- `/dashboard/import-export/imports/[jobId]` — full preview table for one job.  
- `/dashboard/import-export/validation-errors` — cross-job ERROR rows.  

## Examples (by domain)

- **Customers:** email format, missing name, duplicate email.  
- **Menu items:** title, price numeric, SKU duplicate, category enum.  
- **Ingredients:** unit required, numeric cost, duplicate name+unit heuristic.  
- **Orders:** customer reference, fulfillment enum, line JSON, dates.  
- **Nutrition:** numeric macros, allergen tokens from registry, SKU linkage.  

## Persistence

Preview rows are capped by `MAX_PREVIEW_ROWS_PERSISTED` in `lib/import-export/limits.ts` to protect the database.
