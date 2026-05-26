# Storefront analytics & consent

**Marketing pixels:** `StorefrontConsentAndMarketingScripts` — `analyticsConsentMode` `DISABLED | ENABLED_WITH_CONSENT | ENABLED_NO_BANNER` controls GTM/GA/Meta injection (`components/storefront/storefront-consent-banner.tsx`, `storefront-analytics-scripts.tsx`).

**First-party beacon:** `StorefrontSettings.firstPartyAnalyticsMode` — `ALWAYS_ON | CONSENT_REQUIRED | DISABLED`. Public layout injects JSON `#kos-storefront-fp-analytics`. Client `ingestStorefrontFirstPartyEvent` sends `x-kos-fp-consent: always|granted`. API rejects when mode requires consent and header missing (`app/api/storefront/analytics/route.ts`).

**Not legal advice:** Copy is technical only; merchants link privacy policy.

**QA:** Toggle each mode; verify 403/404 on API when expected; marketing still gated separately.

**Roadmap:** Optional separate cookie for first-party only.
