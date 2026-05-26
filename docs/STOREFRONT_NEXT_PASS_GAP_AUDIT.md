# Storefront next pass — gap audit

## Scope reviewed

| Area | Current (before pass) | Risk | Fix (this pass) | Priority |
|------|-------------------------|------|-------------------|----------|
| `app/s/[storeSlug]/layout.tsx` | Hard-coded nav + `StorefrontPublicFooter` | Drift vs builder; unsafe links possible | `StorefrontNavigation` / `StorefrontFooter` + validation + published snapshot | P1 |
| StorefrontNavigation model | JSON `itemsJson` not wired to public layout | Stale builder experience | Parse + validate + i18n labels + fallbacks | P1 |
| StorefrontFooter model | JSON `blocksJson` not wired | Same | Validated blocks + legal HTML sanitization for privacy snippet | P1 |
| StorefrontSettings | No draft/published theme split | Draft could match live accidentally | `themeDraftJson`, `themePublishedJson`, `themePublishedAt`, publish action | P1 |
| StorefrontPage HOME | Type existed; home route ignored sections | No real “home builder” | `/s/[slug]` loads HOME sections when present | P1 |
| StorefrontSectionType | No SLIDER | Hacky JSON only | Enum `SLIDER` + Zod + `SliderSection` | P1 |
| `lib/storefront/sections.ts` | Partial Zod coverage | Invalid JSON persisted | Extended schemas; slider strict schema | P1 |
| Section editor UI | Raw JSON only | Operator error | Permissions + max sections; `section-form-config` foundation (full UI follow-up) | P2 |
| Design tokens | Inline legacy vars only | Inconsistent theming | Feature flag `NEXT_PUBLIC_STOREFRONT_DESIGN_TOKENS_CSS_VARS` + scoped `--sb-*` | P2 |
| Assets | `StorefrontAsset` minimal | No provider discipline | Extended columns + storage provider resolver + setup-required panel | P1 arch |
| Checkout | Shares layout | Theme bleed | Checkout path uses published tokens only; skips scoped design vars; middleware pathname | P0 |
| Legal HTML | `sanitizeRichTextLite` weak | XSS | `sanitizeRichHtmlForLegal` + save-time validation for privacy | P0 |
| Permissions | Implicit owner-only | Staff could mutate | `storefront-permissions` + checks on publish / pages / legal / sections | P1 |
| Performance | Unbounded sections | Abuse / slow pages | `performance-limits.ts` caps + warnings in actions | P2 |
| i18n | Single `locale` string | FR guests | `labels` map on nav/footer validation | P2 |

## Checkout / payments

- No change to Stripe components or pay button classes in this pass.
- Checkout route detection via `x-kos-pathname` header.

## SEO / mobile

- Metadata path unchanged; image lazy hints deferred to follow-up (slider uses `loading="lazy"`).

## Builder permissions note

Prisma `UserRole` is `OWNER | STAFF`. Logical ADMIN/MANAGER/MARKETING are documented as future `WorkspaceMember` mappings in `STOREFRONT_BUILDER_PERMISSIONS.md`.

## Founder access

`workspace.moroz@gmail.com` superadmin bypass remains via `isSuperAdminEmail` in `canStorefront`.
