# Nutrition data model

## Core tables

- **`nutrition_profiles`** — One per product. Macros, serving text, legacy `ingredientsText` / `allergens`, `sourceType`, `verificationStatus`, `verifiedById`, `verifiedAt`, `expiresAt`, `notes`, supplier/lab refs, denormalized `userId` for tenant-scoped queries.
- **`allergen_profiles`** — `containsJson`, `mayContainJson`, `freeFromJson`, optional `crossContactRiskJson`, verification + source.
- **`ingredient_declarations`** — Canonical ingredient statement text + verification.
- **`label_verification_events`** — Append-only audit (`profileType`, `action`, `metadataJson`).
- **`label_templates`** — `packagingLabelType` enum, `layoutJson` optional, `contentJson` for field manifest.
- **`printed_labels`** — Print jobs (`copies`, `status`, links to template/product/order/task).

## Enums

- `LabelDataSourceType`, `LabelVerificationStatus`, `PackagingLabelType`, `LabelAuditProfileType`.

## Migration

`prisma/migrations/20260518103000_nutrition_labels_module/migration.sql` — additive, backfills `nutrition_profiles.user_id`, copies legacy macro columns into new fields where empty, seeds storefront flags for existing storefronts.
