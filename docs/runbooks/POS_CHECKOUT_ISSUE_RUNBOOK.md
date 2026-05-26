# POS checkout issue runbook

## Symptoms
- POS sale fails mid-flight, duplicate charge concerns, register mismatch

## First checks
1. Network connectivity — **offline queue is not implemented**.
2. Browser console + server logs around `/dashboard/pos/terminal`.
3. Stripe / payment method configuration for card flows.

## Safe actions
- Retry sale after connectivity restored; reconcile duplicate orders manually if created.

## Customer template
> We’re investigating POS connectivity. Please use backup manual order entry if needed.
