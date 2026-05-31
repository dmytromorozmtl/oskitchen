# POS — Offline / Degraded Mode

## Implemented

- `PosTerminalClient` shows online/offline indicator (browser `online` / `offline` events).
- `posPaymentAllowedWhileOffline` blocks **placeholder** card flows (`STRIPE_PLACEHOLDER`, `CARD_TERMINAL_PLACEHOLDER`) while offline so OS Kitchen never records a false paid card state.
- `POS_OFFLINE_LIMITATIONS` copy documents that checkout still requires a successful server round-trip.

## Not implemented

- Local queue of carts that sync later with idempotent checkout IDs.
- Conflict resolution when two devices sell the last unit offline.

## Guidance for operators

1. Keep selling **cash** or **mark-paid-after-external-terminal** modes when connectivity is flaky but present.
2. If fully offline, **pause checkout** — draft carts in browser memory only; refreshing the page may lose them until persistence ships.

See also `docs/POS_TERMINAL_UI.md` and in-app hardware page for cashier messaging.
