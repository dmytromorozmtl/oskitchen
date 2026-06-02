# Stripe Terminal hardware (M2, WisePOS E, P400)

Pair physical Stripe readers for card-present payments at the POS.

## Supported devices

| Model | Stripe type | Use case |
|-------|-------------|----------|
| Stripe Reader M2 | `stripe_m2` | Mobile Bluetooth |
| BBPOS WisePOS E | `bbpos_wisepos_e` | Counter Wi‑Fi / Ethernet |
| Verifone P400 | `verifone_p400` | Fixed lane Ethernet |

## Setup

1. Open **Settings → Payment hardware** (`/dashboard/settings/hardware`).
2. Choose reader model and enter the **pairing code** from the device screen.
3. Click **Pair reader** — OS Kitchen registers the reader with Stripe Terminal.
4. On the same page, use **Live reader connection** to discover/connect from the browser session.
5. At **POS Terminal**, select **Card terminal** payment mode to collect payment.

## Code map

| Area | Path |
|------|------|
| Service | `services/payments/stripe-terminal-hardware-service.ts` |
| Settings UI | `app/dashboard/settings/hardware/page.tsx` |
| Reader UI | `components/pos/stripe-terminal-reader.tsx` |
| Catalog types | `lib/payments/stripe-terminal-hardware-types.ts` |

## Requirements

- `STRIPE_SECRET_KEY` and Terminal enabled on your Stripe account.
- Simulated readers: `NEXT_PUBLIC_STRIPE_TERMINAL_SIMULATED=true` for dev without hardware.
