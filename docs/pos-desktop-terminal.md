# Desktop POS Terminal

Professional counter layout at `/dashboard/pos/terminal` with keyboard shortcuts and multi-monitor customer display.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| F1 | Focus product search |
| F2 | Add first visible product |
| F3 | Cash payment |
| F4 | Complete sale |
| F5 | Card / terminal payment |
| F6 | Open discount panel |
| F7 | Focus customer search |
| F8 | Toggle customer display window |
| F9 / ? | Show shortcuts overlay |
| 1–9 | Quick-add visible product by grid position |
| + / - | Adjust last line quantity |
| Esc | Clear cart |

## Multi-monitor customer display

1. Press **F8** or click **Customer display** on the desktop toolbar.
2. A popup opens on the right edge of the screen (typical second monitor).
3. Cart lines, subtotal, discount, and total sync via `BroadcastChannel`.

Route: `/dashboard/pos/terminal/customer-display`

## Files

- `app/dashboard/pos/terminal/page.tsx`
- `components/dashboard/pos-terminal-client.tsx`
- `lib/keyboard/shortcuts.ts`
- `lib/pos/pos-multi-monitor.ts`
