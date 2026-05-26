# Import wizard

## Route

`/dashboard/import-export/import`

## Intended steps

1. Choose import type  
2. Download template  
3. Upload CSV  
4. Column mapping  
5. Validation preview  
6. Review actions (create / update / skip / reject)  
7. Confirm import  
8. Results  

## Current implementation

- **Ingredients:** Steps 3 and 5 are live against the preview pipeline (`createIngredientCsvPreviewJob`). Steps 4–7 will gain UI once generic mapping ships.
- **Other types:** Use templates + support-assisted path until validators are registered per `ImportType`.

## Rules

- Invalid rows must not reach production tables without an explicit confirm step and a completed import executor (future).
- Every upload that enters the pipeline should create or update an `ImportJob` (ingredients preview does).
