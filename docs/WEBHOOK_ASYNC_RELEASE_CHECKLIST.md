# Webhook async — release checklist

- [ ] `npx prisma migrate status` clean on staging/prod target
- [ ] `npm run db:deploy` executed with correct `DIRECT_URL`
- [ ] `WEBHOOK_ASYNC_QUEUE=true` on staging
- [ ] `CRON_SECRET` set; Vercel cron enabled
- [ ] `curl` dry-run cron returns 200
- [ ] WooCommerce test delivery → `PROCESSED`
- [ ] Shopify test delivery → `PROCESSED` (if shop connected)
- [ ] Induced failure → `RETRYING` then `FAILED` within max attempts
- [ ] Replay creates audit row and requeues / reprocesses
- [ ] Public forms still accept traffic under rate limits (no 429 loops)
- [ ] `npm run typecheck && npm run build && npm run lint && npm test`
