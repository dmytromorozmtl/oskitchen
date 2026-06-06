# Desktop POS terminal smoke setup (Era 92)

Era 92 certifies professional desktop POS wiring: F1–F9 keyboard shortcuts and multi-monitor customer display.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/pos/terminal/page.tsx` | Desktop terminal entry |
| `components/dashboard/pos-terminal-client.tsx` | Shortcut handler + cart |
| `lib/keyboard/shortcuts.ts` | F1–F9 + quick-add bindings |
| `lib/pos/pos-multi-monitor.ts` | Second-screen popup + BroadcastChannel |
| `components/pos/customer-display.tsx` | Customer-facing totals |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:pos-desktop-terminal-era92` | Full era92 cert + wiring audit |
| `npm run test:ci:pos-desktop-terminal-era92` | Era92 + shortcut unit tests |
| `npm run test:ci:pos-desktop-terminal-era92:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → POS → Terminal** on a desktop browser (1280px+).
2. Press **F9** — verify shortcut overlay lists F1–F9 actions.
3. Press **F8** or use **Open customer display** — popup on extended monitor.
4. Run `npm run smoke:pos-desktop-terminal-era92` — artifact **PASSED**.

## Key shortcuts

| Key | Action |
|-----|--------|
| F1 | Focus product search |
| F3 | Cash payment |
| F4 | Complete sale |
| F5 | Card payment |
| F8 | Toggle customer display window |
| F9 | Show shortcuts help |
| 1–9 | Quick-add visible product by index |

## Artifact

Summary written to `artifacts/pos-desktop-terminal-smoke-summary.json` (gitignored).
