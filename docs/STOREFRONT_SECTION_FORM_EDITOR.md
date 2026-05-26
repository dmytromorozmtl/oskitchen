# Section form editor

## Current state

- Dashboard page editor (`app/dashboard/storefront/pages/[pageId]/page.tsx`) still uses a JSON `Textarea` per section for rapid compatibility.
- All writes continue through `normalizeSectionContent` in `actions/storefront-pages.ts`.

## Added foundations

- `lib/storefront/section-form-config.ts` — declarative field hints (HERO starter).
- `lib/storefront/section-validation.ts` + `services/storefront/storefront-section-service.ts` — shared validation entrypoints.

## Guards

- Max sections per page: `STOREFRONT_PERF.maxSectionsPerPage` enforced in `addStorefrontSection`.
- RBAC: `storefront:edit-draft` required for section mutations.

## Follow-up (P2)

Replace JSON textarea with per-type React forms + optional “Advanced JSON” drawer for `OWNER` / platform superadmin only; field-level errors from Zod `safeParse`.
