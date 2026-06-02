# Webhook signature verification matrix

**Version:** 1.0 · **June 2026
**Scope:** 52 routes under `app/api/webhooks/**/route.ts`
**Guard library:** `lib/api/webhook-guard.ts` · `requireBearerWebhookSecret` · `requireConfiguredWebhookSecret`

---

## Executive summary

| Metric | Count |
|--------|------:|
| Total `/api/webhooks/*` routes | **52** |
| Signature / secret **VERIFIED** | **52** |
| **UNVERIFIED** (no auth gate) | **0** |

### By category

| Category | Routes | Production risk |
|----------|-------:|-----------------|
| `production-partner` | 14 | GTM / revenue — highest priority |
| `experiment-analytics` | 20 | Internal experiment pipelines — vault-gated |
| `compliance-feed` | 15 | Registry / transparency ingest — vault-gated |
| `internal` | 2 | Ops tooling (Slack, SCIM) |
| `placeholder` | 1 | Auth present; product PLACEHOLDER |

**June 2026 audit result:** All 52 ingress routes reject unsigned requests when secrets are configured. Missing env → **503 fail-closed** (Bearer routes) or **401** after connection lookup (partner HMAC routes).

---

## Verification status legend

| Status | Meaning |
|--------|---------|
| **VERIFIED** | Cryptographic HMAC or timing-safe Bearer check before handler logic |
| **PLACEHOLDER** | Verified ingress; handler returns honest 503 (Uber Direct) |
| **UNVERIFIED** | No signature — **must not ship** (none found in this audit) |

---

## Full matrix (52 routes)

| # | Route | Category | Status | Verification method | Secret / credential | Notes | Unit test |
|---:|-------|----------|--------|---------------------|---------------------|-------|-----------|
| 1 | `/api/webhooks/bigquery-bayesian-prior` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `BIGQUERY_BAYESIAN_PRIOR_WEBHOOK_SECRET` | — | — |
| 2 | `/api/webhooks/bigquery-causal-discovery-outcomes` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `BIGQUERY_CAUSAL_DISCOVERY_WEBHOOK_SECRET` | — | — |
| 3 | `/api/webhooks/bigquery-causal-lift` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `BIGQUERY_CAUSAL_LIFT_WEBHOOK_SECRET` | — | — |
| 4 | `/api/webhooks/bigquery-causal-posteriors` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `BIGQUERY_CAUSAL_POSTERIORS_WEBHOOK_SECRET` | — | — |
| 5 | `/api/webhooks/bigquery-federated-gradients` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `BIGQUERY_FEDERATED_GRADIENTS_WEBHOOK_SECRET` | — | — |
| 6 | `/api/webhooks/bigquery-ga4-parity` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `BIGQUERY_GA4_PARITY_WEBHOOK_SECRET` | — | — |
| 7 | `/api/webhooks/bigquery-global-mesh-outcomes` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `BIGQUERY_GLOBAL_MESH_WEBHOOK_SECRET` | — | — |
| 8 | `/api/webhooks/bigquery-homomorphic-metrics` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `BIGQUERY_HOMOMORPHIC_METRICS_WEBHOOK_SECRET` | — | — |
| 9 | `/api/webhooks/bigquery-interference-matrix` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `BIGQUERY_INTERFERENCE_MATRIX_WEBHOOK_SECRET` | — | — |
| 10 | `/api/webhooks/bigquery-linucb-weights` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `BIGQUERY_LINUCB_WEBHOOK_SECRET` | — | — |
| 11 | `/api/webhooks/bigquery-off-policy` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `BIGQUERY_OFF_POLICY_WEBHOOK_SECRET` | — | — |
| 12 | `/api/webhooks/bigquery-spillover-daily` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `BIGQUERY_SPILLOVER_WEBHOOK_SECRET` | — | — |
| 13 | `/api/webhooks/bigquery-workspace-acl` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `BIGQUERY_WORKSPACE_ACL_WEBHOOK_SECRET` | — | — |
| 14 | `/api/webhooks/capital-lender/[partnerSlug]` | production-partner | VERIFIED | Custom HMAC | `CapitalLenderPartner webhook secret` | — | — |
| 15 | `/api/webhooks/cen-cenelec-digital-product-governance-registry` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `CEN_CENELEC_GOVERNANCE_REGISTRY_WEBHOOK_SECRET` | — | — |
| 16 | `/api/webhooks/doordash/orders` | production-partner | VERIFIED | HMAC-SHA256 | `DOORDASH_WEBHOOK_SECRET / per-connection` | idempotent WebhookEvent | webhook-doordash-route-security.test.ts |
| 17 | `/api/webhooks/eu-ai-act-art71-pmm-live` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `EU_AI_ACT_PMM_WEBHOOK_SECRET` | — | — |
| 18 | `/api/webhooks/eu-ai-act-live-registry` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `EU_AI_REGISTRY_STREAM_WEBHOOK_SECRET` | — | — |
| 19 | `/api/webhooks/eu-ai-office-conformity-sync` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `EU_AI_OFFICE_CONFORMITY_WEBHOOK_SECRET` | — | — |
| 20 | `/api/webhooks/experiment-cislunar-dtn-bundle` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `EXPERIMENT_CISLUNAR_DTN_WEBHOOK_SECRET` | — | — |
| 21 | `/api/webhooks/experiment-dtn-bundle` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `EXPERIMENT_DTN_BUNDLE_WEBHOOK_SECRET` | — | — |
| 22 | `/api/webhooks/experiment-feature-stream` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `EXPERIMENT_FEATURE_STREAM_WEBHOOK_SECRET` | — | — |
| 23 | `/api/webhooks/experiment-feature-stream-flink` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `EXPERIMENT_FEATURE_STREAM_FLINK_SECRET` | — | — |
| 24 | `/api/webhooks/experiment-heliopause-dtn-bundle` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `EXPERIMENT_HELIOPAUSE_DTN_WEBHOOK_SECRET` | — | — |
| 25 | `/api/webhooks/experiment-holdout-ws-push` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `EXPERIMENT_HOLDOUT_WS_WEBHOOK_SECRET` | — | — |
| 26 | `/api/webhooks/experiment-scientist-proposal` | experiment-analytics | VERIFIED | Bearer token (timing-safe) | `EXPERIMENT_SCIENTIST_WEBHOOK_SECRET` | — | — |
| 27 | `/api/webhooks/grubhub/orders` | production-partner | VERIFIED | HMAC-SHA256 | `GRUBHUB_WEBHOOK_SECRET / per-connection` | idempotent WebhookEvent | Task 36 |
| 28 | `/api/webhooks/icao-imo-ai-aviation-registry` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `ICAO_IMO_AVIATION_REGISTRY_WEBHOOK_SECRET` | — | — |
| 29 | `/api/webhooks/iso-42001-cert-body-attest` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `ISO_42001_CERT_BODY_WEBHOOK_SECRET` | — | — |
| 30 | `/api/webhooks/iso-iec-ai-standards-harmonization-registry` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `ISO_IEC_STANDARDS_REGISTRY_WEBHOOK_SECRET` | — | — |
| 31 | `/api/webhooks/itu-uncitral-digital-commerce-ai-registry` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `ITU_UNCITRAL_COMMERCE_REGISTRY_WEBHOOK_SECRET` | — | — |
| 32 | `/api/webhooks/nist-ai-rmf-live-control-feed` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `NIST_AI_RMF_STREAM_WEBHOOK_SECRET` | — | — |
| 33 | `/api/webhooks/oecd-state-ag-ai-transparency-mesh` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `OECD_STATE_AG_TRANSPARENCY_WEBHOOK_SECRET` | — | — |
| 34 | `/api/webhooks/resend` | production-partner | VERIFIED | Svix HMAC | `RESEND_WEBHOOK_SECRET` | IP rate limit | — |
| 35 | `/api/webhooks/scim/experiment-auditor` | internal | VERIFIED | Bearer token | `EXPERIMENT_SCIM_WEBHOOK_SECRET` | — | — |
| 36 | `/api/webhooks/shopify/app-uninstalled` | production-partner | VERIFIED | HMAC-SHA256 | `IntegrationConnection webhook secret` | — | Task 36 |
| 37 | `/api/webhooks/shopify/markets-create` | production-partner | VERIFIED | HMAC-SHA256 | `IntegrationConnection webhook secret` | — | Task 36 |
| 38 | `/api/webhooks/shopify/markets-delete` | production-partner | VERIFIED | HMAC-SHA256 | `IntegrationConnection webhook secret` | — | Task 36 |
| 39 | `/api/webhooks/shopify/markets-update` | production-partner | VERIFIED | HMAC-SHA256 | `IntegrationConnection webhook secret` | — | Task 36 |
| 40 | `/api/webhooks/shopify/orders-create` | production-partner | VERIFIED | HMAC-SHA256 | `IntegrationConnection webhook secret` | — | Task 36 |
| 41 | `/api/webhooks/shopify/orders-updated` | production-partner | VERIFIED | HMAC-SHA256 | `IntegrationConnection webhook secret` | — | Task 36 |
| 42 | `/api/webhooks/shopify/products-update` | production-partner | VERIFIED | HMAC-SHA256 | `IntegrationConnection webhook secret` | — | Task 36 |
| 43 | `/api/webhooks/slack/experiment-interactive` | internal | VERIFIED | Slack signing v0 | `SLACK_SIGNING_SECRET` | ingress dedupe | — |
| 44 | `/api/webhooks/stripe` | production-partner | VERIFIED | Stripe-Signature | `STRIPE_WEBHOOK_SECRET` | IP rate limit | — |
| 45 | `/api/webhooks/uber-direct` | placeholder | VERIFIED | Bearer token | `UBER_DIRECT_WEBHOOK_SECRET` | 503 placeholder response | — |
| 46 | `/api/webhooks/uber-eats/orders` | production-partner | VERIFIED | HMAC-SHA256 | `UBER_EATS_WEBHOOK_SECRET / per-connection` | idempotent WebhookEvent | Task 36 |
| 47 | `/api/webhooks/uk-dsit-algorithmic-transparency` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `UK_DSIT_STREAM_WEBHOOK_SECRET` | — | — |
| 48 | `/api/webhooks/un-ai-office-global-registry-mesh` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `UN_AI_OFFICE_REGISTRY_WEBHOOK_SECRET` | — | — |
| 49 | `/api/webhooks/us-ftc-ai-transparency-live` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `US_FTC_TRANSPARENCY_WEBHOOK_SECRET` | — | — |
| 50 | `/api/webhooks/vertex-ml-model` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `VERTEX_ML_MODEL_WEBHOOK_SECRET` | — | — |
| 51 | `/api/webhooks/woocommerce` | production-partner | VERIFIED | WooCommerce HMAC | `IntegrationConnection webhook secret (`?cid=`)` | — | — |
| 52 | `/api/webhooks/wto-upu-cross-border-ai-trade-registry` | compliance-feed | VERIFIED | Bearer token (timing-safe) | `WTO_UPU_TRADE_REGISTRY_WEBHOOK_SECRET` | — | — |

---

## Production partner routes (priority review)

These 14 routes accept **external partner traffic**. Task 36 adds consolidated unit coverage for non-Stripe HMAC.

| Route | Partner | Header / param |
|-------|---------|----------------|
| `/api/webhooks/stripe` | Stripe | `Stripe-Signature` |
| `/api/webhooks/shopify/* (×7)` | Shopify | `X-Shopify-Hmac-Sha256` + shop domain |
| `/api/webhooks/woocommerce` | WooCommerce | `X-WC-Webhook-Signature` + `?cid=` |
| `/api/webhooks/doordash/orders` | DoorDash | `x-doordash-signature` + `?cid=` |
| `/api/webhooks/grubhub/orders` | Grubhub | `x-grubhub-signature` + `?cid=` |
| `/api/webhooks/uber-eats/orders` | Uber Eats | `x-uber-eats-signature` + `?cid=` |
| `/api/webhooks/resend` | Resend | `svix-signature` / `resend-signature` |
| `/api/webhooks/capital-lender/[partnerSlug]` | Capital lender | `x-kitchenos-capital-signature` |
| `/api/webhooks/uber-direct` | Uber Direct | `Authorization: Bearer` — **PLACEHOLDER** |

---

## Adjacent webhook ingress (outside `/api/webhooks`)

| Route | Status | Verification | Notes |
|-------|--------|--------------|-------|
| `/api/marketplace/stripe-connect/webhook` | VERIFIED | Stripe-Signature | `STRIPE_MARKETPLACE_WEBHOOK_SECRET` |
| `/api/vendor/webhooks` | VERIFIED | Vendor API key Bearer (`vk_…`) | Outbound subscription mgmt, not partner ingress |
| `/api/public/v1/webhooks` | N/A (outbound API) | Public API key guard | Lists/creates webhook events — not partner POST ingress |

---

## Shared verification helpers

| Helper | File | Used by |
|--------|------|---------|
| `requireBearerWebhookSecret` | `lib/api/webhook-guard.ts` | 35 Bearer routes + Uber Direct |
| `verifyShopifyHmac` | `services/integrations/shopify` | 7 Shopify routes via `shopify-handler` |
| `verifyWebhookSignature` | `services/integrations/woocommerce` | WooCommerce |
| `verifyDoorDashWebhookSignature` | `services/integrations/doordash/doordash-marketplace` | DoorDash |
| `verifyGrubhubWebhookSignature` | `services/integrations/grubhub/grubhub-marketplace` | Grubhub |
| `verifyUberEatsWebhookSignature` | `services/integrations/uber-eats` | Uber Eats |
| `verifyResendWebhookSignature` | Resend service | Resend email events |
| `verifySlackRequestSignature` | `lib/storefront/slack-interactive` | Slack experiment interactive |
| `stripe.webhooks.constructEvent` | Stripe SDK | Stripe + marketplace Connect |

---

## Regenerate this matrix

```bash
# From repo root — scan app/api/webhooks/**/route.ts
find app/api/webhooks -name route.ts | wc -l   # expect 52
rg -l 'requireBearerWebhookSecret|verify.*Signature|constructEvent|handleShopifyWebhook|handleWooCommerceWebhook' app/api/webhooks
```

Re-run static audit after adding any new webhook route. CI gate: Task 36 `tests/unit/webhook-signatures.test.ts`.

---

## Related docs & tasks

| Resource | Topic |
|----------|-------|
| [`staging-environment-checklist.md`](../docs/staging-environment-checklist.md) | Webhook URL registration |
| [`doordash-live-integration-plan.md`](../docs/doordash-live-integration-plan.md) | DoorDash G1 smoke |
| Task 36 | `tests/unit/webhook-signatures.test.ts` |
| Task 30 | This matrix |
