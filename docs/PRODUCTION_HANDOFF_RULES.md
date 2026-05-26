# Production handoff rules

Kitchen settings field `channel_handoff_json` (typed helpers in `lib/channels/channel-handoff.ts`) controls:
- Auto-send valid external rows to Order Hub (external table semantics).
- Auto-send to production (default **off**).
- Manual review toggles (unmatched product, fulfillment, catering/event, address, unpaid, high-value threshold).

## Business modes
Defaults should vary by `businessType` — implementation: extend `parseChannelHandoffJson` with presets (meal prep vs restaurant vs catering) without overwriting explicit saves.
