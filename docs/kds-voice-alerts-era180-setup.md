# KDS Voice Alerts setup (Era 180)

Era 180 certifies KDS Voice Alerts wiring (Round 2): text-to-speech message builder, speechSynthesis queue, and KDS daily service triggers — with canonical proof via era105 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/kitchen/voice-alerts.ts` | Message builder + speak/announce/cancel TTS |
| `lib/kitchen/kds-voice-alerts-policy.ts` | Policy id + default speech rate |
| `components/kitchen/kds-daily-service.tsx` | New order, overdue, rush, allergen voice triggers |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:kds-voice-alerts-era180` | Full era180 cert + wiring audit |
| `npm run test:ci:kds-voice-alerts-era180` | Era180 + era105 + voice alerts unit tests |
| `npm run test:ci:kds-voice-alerts-era180:cert` | Wiring cert only (CI gate) |
| `npm run smoke:kds-voice-alerts-era105` | Canonical era105 smoke |

## Human activation

1. Open **Dashboard → Kitchen (main KDS)** with sound enabled.
2. Queue a new order — verify spoken new-order alert via browser TTS.
3. Let a ticket go overdue — confirm overdue voice alert fires once.
4. Trigger rush building/peak — confirm rush voice alerts.
5. Run `npm run smoke:kds-voice-alerts-era180` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `tts_messages` | `buildKdsVoiceAlertMessage` |
| `speech_synthesis` | `speakKdsVoiceAlert` + `SpeechSynthesisUtterance` |
| `new_order_alert` | `"new_order"` trigger in kds-daily-service |
| `overdue_alert` | `"overdue"` trigger in kds-daily-service |
| `rush_alert` | `"rush_peak"` + `"rush_building"` triggers |

## Artifact

Summary written to `artifacts/kds-voice-alerts-era180-smoke-summary.json` (gitignored).

See also: [kds-voice-alerts-era105-setup.md](./kds-voice-alerts-era105-setup.md)
