# Era 20 — Integration health recovery flow proof

**Policy:** `era20-integration-health-recovery-flow-proof-v1` (`KOS-E20-018`)

## Hops

1. Channel / webhook detect  
2. Smoke artifact honesty (`#integration-health-smoke-next-action`)  
3. Recovery checklist (`#integration-recovery-checklist`)  
4. Safe remediation (webhooks, mapping, error recovery)  
5. Live Woo/Shopify smoke (P0-blocked when credentials missing)  

## Forbidden claims

- LIVE channel without artifact PASS  
- SKIPPED upgraded to PASS  

## UI

`/dashboard/integration-health` — **Integration recovery proof** panel above Era 19 recovery checklist.
