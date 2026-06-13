# Predictive daily briefing — Toast IQ parity (P2-38)

**Policy:** `predictive-daily-briefing-p2-38-v1`  
**Department:** AI  
**Route:** [`/dashboard/today`](/dashboard/today)  
**Module:** `lib/ai/predictive-daily-briefing-channel-forecast.ts`

---

## What it does

OS Kitchen surfaces a **predictive daily briefing** on Today with **all-channel today forecasts**:

- DoorDash, Uber Eats, Grubhub, Shopify, WooCommerce, Storefront, Manual, and other analytics channels
- Predicted orders + revenue for **today**
- Actual pace so far vs forecast
- Week-over-week trend vs same weekday last week

Toast IQ publishes similar operator-facing daily intelligence. OS Kitchen delivers **directional, AI-assisted** forecasts from your own order history — **not certified financial audit**.

> **AI-assisted · directional estimates · verify against your channel reports before acting.**

---

## Honest baseline

- **Not affiliated** with Toast
- Forecasts are **deterministic** (same-weekday averages) — not ML black box
- Thin history → lower confidence scores
- External channels without mirrored orders trend **low** until Integration Health is LIVE

Cross-refs: [`toast.md`](./competitor-battle-cards/toast.md) · [`channel-attribution.ts`](../lib/analytics/channel-attribution.ts) · [`AI_COPILOT.md`](./AI_COPILOT.md)

---

## Flow

| Step | Action |
|------|--------|
| 1. `load_channel_order_history` | Last 21 days of orders with channel attribution |
| 2. `build_channel_today_forecasts` | Same-weekday averages per channel |
| 3. `render_today_briefing_panel` | `AiBriefingPanel` → **Today by channel** grid |
| 4. `verify_owner_visibility` | Owners/managers see briefing on `/dashboard/today` |

---

## Channel taxonomy (10 channels)

See `ANALYTICS_CHANNEL_VALUES` in `lib/analytics/channel-attribution.ts`:

STOREFRONT · MANUAL · WOOCOMMERCE · SHOPIFY · DOORDASH · SKIP · UBER_EATS · GRUBHUB · UBER_DIRECT · OTHER

---

## Audit commands

```bash
npm run audit:predictive-daily-briefing-p2-38
npm run check:predictive-daily-briefing-p2-38
```
