# Channel reliability audit — Sales Channels / Channel Command Center

KitchenOS, May 2026. Scope: ingestion from live WooCommerce/Shopify paths, staging, Order Hub, permissions, and operational controls **without** faking partner certifications.

| Area | Current state | Failure mode | Business impact | Recommended fix | Priority |
|------|---------------|--------------|-----------------|-----------------|----------|
| **Webhook ingestion** | Signed Woo + Shopify routes persist `ExternalOrder` and now append `ChannelImportBatch`/`ChannelImportRecord`; duplicate `external_event_id` short-circuits; DB partial unique index added | Signature miss → 401; malformed JSON → 500; race duplicate | Missed orders or operator distrust | Keep staging non-fatal (try/catch); surface failures in Health/Reliability; optional DLQ UI later | **P1** |
| **Sync jobs** | Woo + Shopify order sync log `ChannelSyncJob`; Shopify aligned with Woo; end-of-run staging batch via `sync_job:{id}` | Partial pages fail mid-run | Incomplete Hub rows | Finish job with PARTIAL status + per-page retry (orchestrator extension) | **P1** |
| **Raw event storage** | `WebhookEvent.payloadJson` stores full payload (encrypted at rest via DB); lab stores test-wrapped payloads | Large payloads → storage cost | Higher infra bill | Size cap + redacted views in UI (planned) | **P2** |
| **Order normalization** | `normalizeWooOrder` / Shopify normalizers produce `NormalizedKitchenOrder` | Unknown status strings | Wrong kitchen interpretation | Extend mapping table + `CHANNEL_STATUS_UNKNOWN` | **P1** |
| **Import path to Order Hub** | External rows remain source of truth; staging tracks validation; approve links `importedEntityId` → `ExternalOrder.id` | Operators confuse staging vs Hub | Delayed production | Order Hub links to import batch; docs + UI copy | **P2** |
| **Duplicate detection** | Webhook dedupe by user+provider+external id (app + index); `ExternalOrder` upsert by connection+external id; batch `source_dedupe_key` | Same order two connections rare collision | Double fulfillment | Connection-scoped unique stays; document | **P0** mitigated |
| **Product mapping** | SKU heuristic in staging marks `NEEDS_MAPPING`; conflicts auto-open | Unmapped SKU | Prep stall | Mapping page + conflict resolver | **P1** |
| **Failed import handling** | Record `validationStatus=ERROR`; batch `NEEDS_REVIEW`; webhook `processingError` | Silent failure if staging throws | Ops blind | Staging errors logged; non-blocking around persist | **P1** |
| **Replay safety** | Same webhook id → duplicate response; order upsert updates row | Replay treated as new batch id | Extra staging noise | Batch keyed by `webhook_event:{id}` — idempotent upsert | **P2** |
| **Idempotency** | `lib/channels/idempotency.ts` keys; import batch unique key; record unique per batch+provider+external | Manual key collision | Import blocked | Use UUID suffix for manual/sim paths | **P2** |
| **Manual imports** | CSV remains Import Center; channel staging MANUAL via simulator | Two systems | Confusion | Cross-link docs only; unify later | **P3** |
| **Credentials** | Encrypted fields + audit; owner/super-admin manage | Leak via logs | Account takeover | Never log secrets; mask UI | **P0** process |
| **Health scoring** | Health page exists; Reliability page adds counts | Stale metrics | Wrong prioritization | Wire cron snapshots later | **P2** |
| **Permissions** | `lib/channels/channel-permissions.ts` — owner/super-admin for approve/raw/replay; staff read paths | Staff escalates by mistake | Misconfig | Enforce in server actions (done for approvals) | **P1** |
| **Logging** | `console.error` on staging failure; webhook errors on row | No correlation id | Slow MTTR | Structured logger + trace ids | **P2** |
| **User-facing errors** | `lib/channels/channel-errors.ts` taxonomy | Generic 500 | Support load | Map handler errors to codes in UI | **P2** |

### Priority legend
- **P0** — data loss / duplicate order risk (process + constraints).
- **P1** — operational risk.
- **P2** — UX / observability.
- **P3** — future consolidation.

### Immediate engineering follow-ups
1. Run Prisma migrations on every environment: `channel_import_*`, `orders` trace columns, `external_orders.channel_import_batch_id`, webhook partial unique index.
2. Extend rule **execution** (currently JSON storage + toggles only).
3. Add redacted raw-payload viewer for permitted roles.
