# AI briefing email — public sample

**Policy:** `ai-briefing-email-sample-v1`  
**Updated:** 2026-06-02  
**Owner:** Marketing + Product  
**Status:** **Illustrative sample** — not a real customer inbox or verified outcome  
**Module:** AI Restaurant Brain (module 1 of 7) · [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md)  
**Implementation:** `lib/ai/briefing-delivery-format.ts` · `services/ai/briefing-delivery.ts`  
**UI counterpart:** `/dashboard/today` · [`demo-video-script-today.md`](./demo-video-script-today.md)

Use this document for **sales decks, website copy, and design-partner previews**. The HTML below mirrors production `formatBriefingEmail()` — numbers and item names are **synthetic demo data**.

**Honesty rule:** Label as “sample briefing” everywhere public. Do not imply guaranteed revenue, autonomous management, or sent without operator review when delivery is disabled.

---

## What this email is

| Aspect | Truth |
|--------|-------|
| **Source** | Deterministic rules + structured ops data (`generateDailyBriefing`) |
| **Label** | “AI-assisted briefing” — not LLM prose or ChatGPT |
| **Delivery** | Optional email via Resend when env + workspace settings enabled |
| **SMS** | Critical predictive alerts only — Twilio env-gated |
| **Review** | Operator should verify before POs, scheduling, or pricing changes |
| **Maturity** | `pilot_ready` — per-module caveat required in same sentence |

**Not:** Autonomous GM · guaranteed margin lift · 100% accurate forecasts · sent to all tenants by default.

---

## Sample metadata

| Field | Value |
|-------|-------|
| **From** | `briefings@notifications.kitchenos.app` (example — match Resend domain) |
| **To** | Owner email on workspace |
| **Subject** | `OS Kitchen Daily Briefing — Tuesday, Jun 2` |
| **Preheader** | AI-assisted briefing · confidence 78% · 1 critical item |
| **CTA** | Open Today dashboard → `/dashboard/today` |

Subject line production helper: `formatBriefingEmailSubject()` in `briefing-delivery-format.ts`.

---

## Plain-text sample (public-safe)

```
AI-assisted briefing · confidence 78%

OS Kitchen Daily Briefing
Tuesday, Jun 2

1 critical item(s) — Review inventory, labor, and predictive alerts in the dashboard.

Forecast: $18,400 revenue · 142 orders (confidence 72%)

INVENTORY
- Chicken breast 20kg: Below par — reorder 40kg suggested (confidence 85%)
- GN lids (1/3): 4 days remaining at current usage (confidence 80%)

LABOR
- Lunch production — KDS load above baseline (impact $320)

MENU PROFITABILITY
- Family meal box: margin 38.2% — promote on storefront this week

PROFIT DRIVERS
- Packaging cost drift: review vendor SKU PKG-4412

PREDICTIVE ALERTS
- [critical] Shopify webhook lag: verify integration health (impact $0)

---
Suggestions are AI-assisted from your operational data — verify before purchasing or scheduling changes.
Open Today dashboard: https://app.os-kitchen.com/dashboard/today

Sample data for illustration only — not a real operator inbox.
```

---

## HTML sample (matches production layout)

Rendered by `formatBriefingEmail(briefing, alerts)`. Inline styles intentional for email clients.

```html
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#111;max-width:640px;margin:0 auto;padding:24px;">
  <p style="font-size:12px;color:#666;margin:0 0 8px;">AI-assisted briefing · confidence 78%</p>
  <h1 style="font-size:22px;margin:0 0 4px;">OS Kitchen Daily Briefing</h1>
  <p style="margin:0 0 16px;color:#444;">Tuesday, Jun 2</p>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
    <strong style="color:#b91c1c;">1 critical item(s)</strong>
    <p style="margin:8px 0 0;font-size:14px;color:#7f1d1d;">Review inventory, labor, and predictive alerts in the dashboard.</p>
  </div>
  <p style="margin:0 0 16px;"><strong>Forecast:</strong> $18,400 revenue · 142 orders (confidence 72%)</p>

  <h3 style="margin:16px 0 8px;font-size:15px;">Inventory</h3>
  <ul style="margin:0;padding-left:20px;">
    <li style="margin-bottom:6px;">Chicken breast 20kg: Below par — reorder 40kg suggested (confidence 85%)</li>
    <li style="margin-bottom:6px;">GN lids (1/3): 4 days remaining at current usage (confidence 80%)</li>
  </ul>

  <h3 style="margin:16px 0 8px;font-size:15px;">Labor</h3>
  <ul style="margin:0;padding-left:20px;">
    <li style="margin-bottom:6px;">Lunch production — KDS load above baseline (impact $320)</li>
  </ul>

  <h3 style="margin:16px 0 8px;font-size:15px;">Menu profitability</h3>
  <ul style="margin:0;padding-left:20px;">
    <li style="margin-bottom:6px;">Family meal box: margin 38.2% — promote on storefront this week</li>
  </ul>

  <h3 style="margin:16px 0 8px;font-size:15px;">Profit drivers</h3>
  <ul style="margin:0;padding-left:20px;">
    <li style="margin-bottom:6px;">Packaging cost drift: review vendor SKU PKG-4412</li>
  </ul>

  <h3 style="margin:16px 0 8px;font-size:15px;">Predictive alerts</h3>
  <ul style="margin:0;padding-left:20px;">
    <li style="margin-bottom:6px;">[critical] Shopify webhook lag: verify integration health (impact $0)</li>
  </ul>

  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="font-size:12px;color:#888;margin:0;">
    Suggestions are AI-assisted from your operational data — verify before purchasing or scheduling changes.
    <a href="https://app.os-kitchen.com/dashboard/today">Open Today dashboard</a>
  </p>
  <p style="font-size:11px;color:#aaa;margin:12px 0 0;">Sample briefing for marketing — synthetic data.</p>
</body>
</html>
```

**Production file (Task 84):** `templates/emails/ai-briefing-email.html` — keep in sync with `formatBriefingEmail()` when template ships.

---

## Critical SMS sample (optional channel)

From `formatCriticalAlertsSms()` — **critical severity only**, max 3 lines in body:

```
OS Kitchen CRITICAL (1): Shopify webhook lag ($0). Open Today dashboard.
```

**Honesty:** SMS is env-gated (`TWILIO_*`), not default for all pilots. Do not market as “24/7 SMS alerts” without scope doc.

---

## Section reference (payload → email)

| Email section | `DailyBriefing` field | Max rows in email |
|---------------|----------------------|-------------------|
| Header confidence | `overallConfidence` | — |
| Critical banner | `countCriticalAiBriefingAlerts` + critical `PredictiveAlert` | — |
| Forecast | `weeklyForecast` | revenue, orders, confidence |
| Inventory | `inventoryAlerts[]` | 8 |
| Labor | `laborInsights[]` | 6 |
| Menu profitability | `menuInsights[]` | 6 |
| Profit drivers | `profitInsights[]` | 5 |
| Predictive alerts | `PredictiveAlert[]` (parallel fetch) | 8 |

Types: `lib/ai/restaurant-brain-types.ts` · alerts: `lib/ai/predictive-alerts-types.ts`.

---

## Delivery configuration (internal)

| Env / setting | Purpose |
|---------------|---------|
| `RESEND_API_KEY` | Email send |
| `BRIEFING_DELIVERY_*` / workspace prefs | Opt-in, schedule, recipients |
| Dedupe key | `ai-briefing-email:{workspaceId}:{YYYY-MM-DD}` — one email per workspace per day |

Cron or manual trigger: `services/ai/briefing-delivery.ts` → `deliverDailyBriefingForWorkspace`.

**Pre-scale:** Delivery disabled in most staging workspaces until pilot configures recipients.

---

## Public usage guidelines

| Surface | Allowed | Required label |
|---------|:-------:|----------------|
| Sales deck screenshot | ✓ | “Sample briefing — synthetic data” |
| Website product page | ✓ | “Illustrative email — deterministic AI-assisted” |
| LinkedIn / blog | ✓ | Link to this doc |
| Customer testimonial | ✗ | No real inbox without written approval |
| “You will receive daily emails” | ✗ | Say “optional when configured” |

**Safe one-liner:**

> Optional owner daily briefing email — deterministic sections from your order hub, KDS, and inventory signals, with confidence scores and a Today dashboard link. Not autonomous decision-making.

---

## Forbidden in public materials

From [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md):

| Do not say | Say instead |
|------------|-------------|
| AI manager replaces your GM | AI-assisted briefing on Today |
| Guaranteed revenue from forecast | Predicted revenue with confidence % |
| Always accurate inventory | Reorder suggestions — verify before PO |
| Magic / AGI / untouchable | Seven modules at qualified maturity |
| Email sent to every customer | Optional delivery when Resend configured |

Run before publishing screenshots with copy:

```bash
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
```

---

## Related docs & tasks

| Resource | Use |
|----------|-----|
| [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md) | Module 1 positioning |
| [`demo-video-script-today.md`](./demo-video-script-today.md) | Video walkthrough of same briefing on Today |
| [`feature-announcement-template.md`](./feature-announcement-template.md) | Launch email delivery feature (BETA) |
| Task 84 | `templates/emails/ai-briefing-email.html` |
| Task 81 | Briefing delivery integration test |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-02 | Initial public sample — Task 70 · aligned to `formatBriefingEmail` |
