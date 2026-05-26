# Storefront Phase C — weeks 2–4

Ordered backlog with **current code status** and acceptance criteria.

---

## C1. Media upload in bucket

| | |
|---|---|
| **Status** | Implemented — `services/storefront/storefront-media-upload-service.ts`, `/dashboard/storefront/media` |
| **Gap** | Prod env: bucket + credentials |
| **Do** | Set `STOREFRONT_SUPABASE_STORAGE_BUCKET` (or S3 vars in `.env.storefront.production.example`) |
| **Acceptance** | Upload JPEG in Media → URL appears in theme/slider without pasting HTTPS manually |

---

## C2. Slider section

| | |
|---|---|
| **Status** | Implemented — `SliderSection`, builder editor, public render |
| **Gap** | Content seeding + QA on real stores |
| **Do** | Builder → add Slider section → 2+ slides with media library URLs |
| **Acceptance** | Keyboard arrows move slides; `aria-label` on section; mobile swipe works |

---

## C3. Mobile preview in admin

| | |
|---|---|
| **Status** | **Implemented** — Preview tab viewport toggle (375 / 768 / full) |
| **Acceptance** | `/dashboard/storefront/preview` → switch Mobile → layout matches phone |

---

## C4. Forms builder E2E

| | |
|---|---|
| **Status** | Builder + honeypot + rate limit exist; **E2E added** — `e2e/storefront-forms-contact.spec.ts` |
| **Gap** | File upload fields, full visual builder parity |
| **Acceptance** | CI Playwright: contact form submits on staging |

---

## C5. Analytics funnel dashboard

| | |
|---|---|
| **Status** | **Enhanced** — funnel includes `order_status_view` when tracked |
| **Gap** | GA4 import, cohort exports |
| **Acceptance** | Analytics tab shows Visit → … → Orders with non-zero steps after traffic |

---

## Suggested schedule

| Week | Focus |
|------|--------|
| 2 | C1 env + C2 slider content on 1 pilot store |
| 3 | C4 forms E2E in staging gate; C5 review funnel with real traffic |
| 4 | C5 GA4 parity (if `googleAnalyticsId` set); polish |
