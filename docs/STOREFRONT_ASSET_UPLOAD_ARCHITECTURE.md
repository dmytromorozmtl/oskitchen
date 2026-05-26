# Storefront asset upload architecture

## Decision

Support **either** Supabase Storage **or** S3-compatible storage via env detection (`lib/storefront/storage-provider.ts`). No upload is performed until a provider is configured.

## Prisma

`StorefrontAsset` extended with: `storageProvider`, `storageKey`, `mimeType`, `sizeBytes`, `altText`, `usageType`, `createdByUserId`, `updatedAt` (plus existing `url` as public URL).

## Services

- `services/storefront/storefront-storage-service.ts` — `getStorefrontStorageStatus`.
- `services/storefront/storefront-asset-service.ts` — `assertStorefrontAssetUploadAllowed`, `listStorefrontAssetsForUser`.

## Validation

- `lib/storefront/asset-validation.ts` — allow-list JPEG/PNG/WebP; size cap uses `STOREFRONT_PERF.defaultMaxImageBytes` (override via `STOREFRONT_MAX_IMAGE_BYTES`).

## UI stubs

- `components/storefront-builder/asset-upload-panel.tsx` — setup-required messaging (no fake upload).
- `components/storefront-builder/asset-picker.tsx` — placeholder.

## Next wiring steps

Authenticated server action → magic-byte sniff / MIME check → provider upload → persist metadata → audit log (no secrets in client payloads).
