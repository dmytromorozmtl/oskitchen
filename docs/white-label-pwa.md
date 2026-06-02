# White-label PWA

Restaurant owners publish a **branded Progressive Web App** so customers install the venue on their phone like a native app — without App Store review.

## Owner flow

1. **Settings → Branding** — upload logo URL, pick accent color (presets or custom hex), preview on phone mockup.
2. **Publish branded PWA** — syncs logo/color to storefront, enables published storefront, writes manifest + service worker URLs.
3. Share **install link**: `/branding?slug={storeSlug}`.

## Customer flow

1. Open install link on mobile.
2. Tap **Install app** (Android) or use Safari **Add to Home Screen** (iOS).
3. App opens at `/s/{slug}` with menu and ordering.

## Technical

| Piece | Path |
|-------|------|
| Service | `services/branding/white-label-service.ts` |
| Manifest | `/s/{slug}/manifest.webmanifest` |
| Service worker | `/s/{slug}/sw.js` |
| Install landing | `/branding?slug=` |
| Dashboard | `/dashboard/settings/branding` |

## Competitor comparison

| Product | Branded customer app |
|---------|----------------------|
| Toast | Custom app programs — months + separate vendor |
| Square | Limited; mostly Square consumer app |
| **OS Kitchen** | **5-minute PWA** with your logo and colors |

## Sales pitch

> "Your guests install *your* restaurant on their home screen tonight — not a generic marketplace app. Logo, brand color, menu, and reorder in one tap."
