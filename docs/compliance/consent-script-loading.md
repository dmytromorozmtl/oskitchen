# Consent-Gated Script Loading

KitchenOS marketing analytics and advertising tags must not load before consent
on public marketing surfaces where consent is required.

## Current Pattern

Relevant files:

- `components/analytics/cookie-consent.tsx`
- `components/analytics/google-analytics.tsx`
- `components/analytics/google-ads.tsx`
- `components/analytics/meta-pixel.tsx`
- `components/analytics/linkedin-insight.tsx`
- `components/analytics/use-marketing-consent.ts`
- `lib/analytics/marketing-consent.ts`

## Rules

1. Essential cookies may run without marketing consent.
2. GA4 may initialize with `denied` consent defaults.
3. Google Ads, Meta Pixel, and LinkedIn Insight must not render before consent.
4. Consent changes must notify mounted tracker components.
5. Marketing trackers should remain off on dashboard/platform/auth routes.

## Implementation Notes

- Cookie banner writes the `kitchenos-cookie-consent` cookie.
- Shared consent helpers dispatch `kitchenos:marketing-consent-changed`.
- Tracker components mount only after the consent hook reports approval.
- Decline flow revokes GA/Meta consent signals and keeps ad tags unmounted.

## Remaining Follow-Up

1. Region-aware consent mode if KitchenOS wants stricter geo-based defaults.
2. Formal consent audit for all future third-party scripts.
3. Test coverage for public layout-level tracker mounting behavior.
