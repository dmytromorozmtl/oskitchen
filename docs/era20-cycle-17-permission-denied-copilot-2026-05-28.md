# Era 20 Cycle 17 — Copilot permission-denied UX

**Policy:** `era20-permission-denied-copilot-cycle17-v1` (`KOS-E20-017`)

## Wired routes

- `app/dashboard/copilot/layout.tsx` — `copilot.view` before subnav + children
- `app/dashboard/copilot/chat/page.tsx` — `copilot.chat` before queries
- `app/dashboard/copilot/audit/page.tsx` — `copilot.read.audit` before queries
- `app/dashboard/copilot/settings/page.tsx` — `copilot.settings.manage` before queries

## Surfaces

- `copilot_hub`, `copilot_chat`, `copilot_audit`, `copilot_settings`

## Tests

`npm run test:ci:permission-denied-ux-era20-cycle17`
