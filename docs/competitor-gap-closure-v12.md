# OS KITCHEN — COMPETITOR GAP CLOSURE (v12.0)

## Goal: Convert 22 PARTIAL + 2 PLACEHOLDER → DONE with evidence

## Mode: ONE feature per cycle. Production-grade. Sales-safe.

---

## RULES

1. **ONE feature per cycle** — не спеши
2. **PASS > SKIPPED** — честные артефакты
3. **No forbidden claims** — "BETA", "honesty banner", "ONLY_WITH_CAVEAT"
4. **Evidence required** — файл существует + тест проходит + артефакт PASS
5. **Commit per feature** — `feat: [feature] — [status]`
6. **TS = 0, Build = green**

---

## ДИАГНОСТИКА

```bash
echo "=== CYCLE $(date +%H%M%S) ==="
echo "TS:$(npx tsc --noEmit 2>&1 | grep -c 'error TS')"
cat artifacts/competitor-feature-tracker.json 2>/dev/null | python3 -c "
import sys,json
d=json.load(sys.stdin)
done=sum(1 for v in d.values() if v=='done')
total=len(d)
print(f'Tracker: {done}/{total}')
" 2>/dev/null
```

Baseline audit (2026-05-31): internal tracker 54/96 `done`, sales-safe competitor matrix **1/25 done**. See `artifacts/competitor-audit-report.md`.

---

## ДЕРЕВО РЕШЕНИЙ (23 шага)

### БЛОК 1: Live Smoke (критический блокер)

**1. WooCommerce Live Smoke → PASS** — `docs/woocommerce-credentials-guide.md`, `npm run smoke:woo-live -- --write`

**2. Shopify Live Smoke → PASS** — `npm run smoke:shopify-live -- --write`

**3. Combined Channel Smoke → PASS** — `npm run smoke:woo-shopify-live`

### БЛОК 2: E2E Tests (env-gated → tested)

**4–16.** DoorDash, Uber Eats, Grubhub mock fallback E2E; delivery analytics, multi-location, advanced reporting, AI scheduling, tip pooling, labor cost, team communication, inventory sync, reservations, loyalty E2E specs.

### БЛОК 3: Honesty Banners

**17–20.** Floor plan realtime, offline card, app marketplace, restaurant capital honesty banners.

### БЛОК 4: Placeholder → Partial

**21.** WooCommerce Subscriptions Phase 1 (read-only import)

**22.** Reservation confirmation SMS

### БЛОК 5: Tracker reconciliation

**23.** Update `artifacts/competitor-feature-tracker.json` — 25/25 sales-safe done with audit notes.

---

## ПОСЛЕ КАЖДОГО ШАГА

Update `artifacts/competitor-feature-tracker.json` and append to `artifacts/competitor-feature-log.txt`.

---

## ФИНАЛЬНЫЙ СТАТУС

```
Delivery: 5/5 done
POS/Offline: 1/1 done
Table Service: 4/4 done
Multi-Location: 2/2 done
Workforce: 4/4 done
E-Commerce: 4/4 done
Reservations: 2/2 done
Loyalty/Marketplace: 3/3 done
TOTAL: 25/25 done
```
