# ADR 0003: INLINE_LOW_VOLUME webhook processing

**Status:** Accepted  
**Date:** 2026-05-24

## Context

Stripe, WooCommerce, Shopify, and storefront webhooks must be reliable without running a separate worker fleet at pre-revenue scale.

## Decision

Process webhooks inline in API route handlers with idempotency (`WebhookEvent` unique on `connectionId` + `externalEventId`). Health endpoint reports `queueMode: INLINE_LOW_VOLUME`.

## Consequences

**Positive:** No Redis queue infra required initially.  
**Negative:** Spike traffic can lengthen request duration; migrate to BullMQ/Inngest when sustained >100 webhooks/min.

## Review trigger

Prometheus/Sentry p95 webhook handler >3s for 24h, or duplicate-event retries >1% despite unique constraint.
