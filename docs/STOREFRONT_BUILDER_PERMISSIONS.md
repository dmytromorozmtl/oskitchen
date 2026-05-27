# Storefront builder permissions

## Implementation

- `lib/storefront/storefront-permissions.ts` — permission strings + defaults.
- `services/storefront/storefront-permission-service.ts` — loads `UserProfile.role` + email for superadmin bypass.

## Defaults

- `OWNER`: full set including publish, legal, domain (domain gating still in domain actions — future tighten).
- `STAFF`: `storefront:view` only (no draft edits, no publish).

## Superadmin

`workspace.moroz@gmail.com` continues to bypass via `isSuperAdminEmail`.

## Actions gated (high level)

- Page/section/navigation/footer/business settings mutations: canonical `storefront.manage` via `assertStorefrontManageAccess` / `requireStorefrontManageActor` (legacy `storefront:edit-draft` staff flag still bridged).
- Page publish checkbox: canonical `storefront.publish` (server via `requireStorefrontPublishActor`; legacy `storefront:publish` staff flag still bridged).
- Theme publish snapshot: canonical `storefront.publish` (same helper; theme page hides form when denied).
- Media upload/delete: canonical `storefront.media.manage` (`requireStorefrontMediaActor`; media page hides dropzone/delete when denied).
- Privacy HTML: `storefront:edit-legal` (non-empty privacy text).
- Business contact block: `storefront:edit-draft`.

## Future roles

ADMIN / MANAGER / MARKETING / VIEWER documented conceptually — map when multi-role workspace members ship beyond Prisma `UserRole`.
