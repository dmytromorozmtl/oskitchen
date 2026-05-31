# Nutrition data entry

- Dashboard item page and legacy nutrition form share `upsertNutritionProfileAction` / `upsertNutritionProfileFormAction`.
- Required before **Verify**: serving size present; source type selected (defaults to `MANUAL`).
- Supplier and lab reference fields capture traceability pointers; attach real PDFs outside OS Kitchen if required by your program.
- Saving a draft sets verification to `NEEDS_REVIEW` and clears verifier to force re-check after edits.

See `actions/nutrition-profile.ts`.
