# Voice ordering (Alexa & Google Home)

Restaurant owners enable spoken orders from smart speakers. Commands are parsed with **AI-assisted** deterministic menu matching (no external LLM required at runtime).

## Setup

1. Open **Settings → Voice ordering** (`/dashboard/settings/voice`).
2. Enable voice ordering and copy the **webhook secret**.
3. Point your Alexa skill or Google Home fulfillment URL to:
   - `POST /api/voice/alexa`
   - `POST /api/voice/google`
4. Send header `X-Voice-Secret: <secret>` and JSON body:

```json
{
  "ownerUserId": "<workspace-owner-uuid>",
  "utterance": "add two lattes to table 5"
}
```

Structured slots (higher confidence):

```json
{
  "ownerUserId": "...",
  "slots": { "table": "5", "item": "latte", "quantity": 2 }
}
```

## Kitchen display

Orders appear on KDS with a purple **Voice** badge and table label (`components/kitchen/voice-order-ticket.tsx`).

## Example phrases

- “Alexa, ask OS Kitchen to add two lattes to table five”
- “Ok Google, order one espresso for table patio-a”

## Code map

| Area | Path |
|------|------|
| Service | `services/voice/voice-ordering-service.ts` |
| Settings UI | `app/dashboard/settings/voice/page.tsx` |
| Webhooks | `app/api/voice/alexa/route.ts`, `app/api/voice/google/route.ts` |
| Metadata | `lib/voice/voice-order-meta.ts` |
