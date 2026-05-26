# Packing verification

## What it does

`/dashboard/packing/verify` is the **packing QC console** for authenticated staff. It supports:

- **QR scan** (browser camera via `html5-qrcode`) and **manual** token entry — same resolver as before: `publicLookupToken` or order UUID, scoped to the signed-in workspace.
- **Customer name lookup** (server-side search on `Order.customerName`).
- **Verification sessions** with an **item checklist**, allergen/label checks, issue statuses, completion (pass / partial / fail), **supervisor override** (owner or platform superadmin), and **send back to packing**.
- **Legacy packing events** — quick `PackingEvent` buttons remain for existing audit integrations.
- **New QC audit** — append-only `packing_qc_events` plus `packing_scan_events` for scan telemetry. Task-tab `packing_verification_events` are unchanged.

`/dashboard/scan` may alias the same flow where configured.

## Setup

Use tokens from packing slips or Order detail (`publicLookupToken`). Station tablets can use fullscreen mode in the console.

## Documentation set

| Doc | Topic |
|-----|--------|
| `PACKING_VERIFICATION_AUDIT.md` | Gaps, priorities, security notes |
| `PACKING_VERIFICATION_ARCHITECTURE.md` | Layers, models, dual audit |
| `PACKING_VERIFICATION_SCAN_FLOW.md` | Scan → session → complete |
| `PACKING_VERIFICATION_ITEM_CHECKLIST.md` | Line-level actions |
| `PACKING_VERIFICATION_ISSUES.md` | Issues and send-back |
| `PACKING_VERIFICATION_ALLERGEN_LABEL_CHECKS.md` | Safety + disclaimer |
| `PACKING_VERIFICATION_WAVES_ROUTES_EVENTS.md` | Batch verification roadmap |
| `PACKING_VERIFICATION_HANDOFF.md` | Ready / delivery handoff |
| `PACKING_VERIFICATION_PERMISSIONS.md` | Roles and hardening |
| `PACKING_VERIFICATION_QA_CHECKLIST.md` | Regression list |
| `PACKING_VERIFICATION_READY_REPORT.md` | Ship summary |

## Limitations

- Wave / route / event batch verification is partially scaffolded (see audit).
- `SENT_BACK_PRODUCTION` is reserved in types — not wired to production queues yet.
- Guest SMS/email from verify events is still a separate notifications concern.

## Future improvements

- Role-based gates on every QC action (packer vs lead vs manager).
- Per-bag QR resolution to `BAG_VERIFY` sessions.
- Offline-first PWA for weak wifi.
