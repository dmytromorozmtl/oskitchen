# Desktop POS terminal setup (Era 167)

Era 167 certifies professional desktop POS wiring (Round 2): F1–F9 keyboard shortcuts and multi-monitor customer display — with canonical proof via era92 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/pos/terminal/page.tsx` | Desktop terminal entry |
| `app/dashboard/pos/terminal/customer-display/page.tsx` | Customer display route |
| `components/dashboard/pos-terminal-client.tsx` | Shortcut handler + cart |
| `components/pos/pos-desktop-shortcuts-overlay.tsx` | F9 shortcut overlay |
| `components/pos/customer-display.tsx` | Customer-facing totals |
| `lib/keyboard/shortcuts.ts` | F1–F9 + quick-add bindings |
| `lib/pos/pos-multi-monitor.ts` | Second-screen popup + BroadcastChannel |
| `lib/pos/pos-desktop-shortcuts-policy.ts` | Desktop POS policy constants |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:pos-desktop-terminal-era167` | Full era167 cert + wiring audit |
| `npm run test:ci:pos-desktop-terminal-era167` | Era167 + era92 + shortcut unit tests |
| `npm run test:ci:pos-desktop-terminal-era167:cert` | Wiring cert only (CI gate) |
| `npm run smoke:pos-desktop-terminal-era92` | Canonical era92 smoke |

## Human activation

1. Open **Dashboard → POS → Terminal** on a desktop browser (1280px+).
2. Press **F9** — verify shortcut overlay lists F1–F9 actions.
3. Press **F8** or use **Open customer display** — popup on extended monitor.
4. Run `npm run smoke:pos-desktop-terminal-era167` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `keyboard_shortcuts` | F1–F9 + 1–9 quick-add via `matchPosShortcut` |
| `multi_monitor` | `openPosCustomerDisplayWindow` + BroadcastChannel sync |

## Artifact

Summary written to `artifacts/pos-desktop-terminal-era167-smoke-summary.json` (gitignored).

See also: [pos-desktop-terminal-era92-setup.md](./pos-desktop-terminal-era92-setup.md)
