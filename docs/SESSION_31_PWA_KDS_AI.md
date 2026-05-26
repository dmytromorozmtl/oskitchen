# Session 31 — PWA, Realtime KDS, OpenAI Integration

**Date:** 20 May 2026  
**Production:** https://os-kitchen.com

## 1. PWA / Offline Mode

- Manual `public/sw.js` + `RegisterServiceWorker` (Next 15–compatible; `@ducanh2912/next-pwa` breaks `next build`)
- Caching: static assets (cache-first), critical dashboard routes (stale-while-revalidate), API (network-first)
- Updated `public/manifest.webmanifest` — `start_url: /dashboard/today`, standalone display
- `components/pwa/offline-indicator.tsx` in root layout

## 2. Supabase Realtime KDS

- `components/kitchen/kds-daily-service.tsx` — postgres_changes on `orders` filtered by `user_id`
- On change → `fetchDailyKdsOrdersAction()` (full tenant-safe data with line items)
- Fallback poll: 15s (not subscribed) / 60s (subscribed)
- Live indicator in KDS header

**Ops:** Enable replication for `orders` in Supabase Dashboard → Database → Replication.

## 3. OpenAI Kitchen AI

- `services/ai/kitchen-ai-service.ts` — forecast, menu suggestions, purchasing recommendations
- Falls back to historical baseline when `OPENAI_API_KEY` unset
- `actions/kitchen-ai.ts` + `KitchenAiTools` on Copilot page
- AI forecast page uses enhanced service

## Manual QA URLs

| Feature | URL |
|---------|-----|
| PWA install | `/dashboard/today` (Add to Home Screen) |
| KDS realtime | `/dashboard/kitchen` (daily service mode) |
| AI tools | `/dashboard/copilot` |
| AI forecast | `/dashboard/forecast/ai` |
