# P1-34 — AI messaging: AI-assisted not AI-powered

**Policy:** `ai-messaging-p1-34-v1`  
**Registry:** [`artifacts/ai-messaging-p1-34.json`](../artifacts/ai-messaging-p1-34.json)

## Contract

Customer-facing copy must use **AI-assisted** (human-in-the-loop) — never unqualified **AI-powered** autonomy claims.

**Approved:** `AI-assisted operations — human-in-the-loop, verify before acting`

**Banned:** AI-powered, AI powered, fully AI-powered (see policy for full list)

Scanned paths: `lib/marketing`, `components/marketing`, `app/ai`, `lib/ai/ai-honesty-labels.ts`, AI docs.

## Verify

```bash
npm run check:ai-messaging-p1-34
```
