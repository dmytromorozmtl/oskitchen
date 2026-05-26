# Kitchen Screen tablet UX

## Implemented

- **Sticky header** with business-mode title, live clock, task count, late badge, refresh, fullscreen toggle, card density toggle.
- **Station tabs** with workload counts; URL `?station=`.
- **Mode** select (`?mode=`).
- **Fullscreen** (`?fullscreen=1` or `/dashboard/kitchen/fullscreen`) — fixed `z-[200]` dark shell over dashboard chrome.
- **Large tap targets** (`min-h-11` / `min-h-14`, `text-lg`–`4xl` titles).
- **Auto-refresh** ~28s + manual refresh (soft “live” strategy).
- **Allergen strip** high-contrast on cards.
- **Disclaimer** footer in fullscreen for label compliance.

## Planned

- Wake lock API (optional, user gesture).
- Sound cue placeholder for new rush items.
- High-contrast theme flag independent of app theme.
