# Manual Staff Visibility Checklist

**Цель:** подтвердить, что staff member видит заказы workspace owner после backfill Phase 3.

**Pre-requisite (automated):**

```bash
npm run verify:staff-scope -- --owner-email=OWNER@EMAIL
```

Ожидание: `dataUserId → owner OK`, `null_workspace=0`.

---

## Setup (5 min)

1. **Owner account** — `OWNER@EMAIL` (уже есть заказы на staging).
2. **Staff account** — пригласить через Settings → Team (или `WorkspaceMember` в DB).
3. Staff логинится в **отдельном браузере / incognito** (не owner session).

---

## Test matrix

| # | Surface | Owner | Staff | Pass? |
|---|---------|-------|-------|-------|
| 1 | `/dashboard/orders` — order count | записать N | должен быть **N** | [ ] |
| 2 | `/dashboard/order-hub` — triage counts | записать | должен совпадать | [ ] |
| 3 | Open order detail `/dashboard/orders/[id]` | opens | same order opens | [ ] |
| 4 | Update order status (e.g. CONFIRMED → PREPARING) | OK | OK if role has `orders.manage` | [ ] |
| 5 | Packing scan token lookup | finds order | finds same order | [ ] |
| 6 | Export `/api/export?type=orders` | 200 CSV | 200 or 403 per role | [ ] |
| 7 | Import center `/dashboard/import-center` | visible | 403 UI gate if no `workspace.settings` | [ ] |

---

## Failure triage

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Staff sees 0 orders | `workspace_id` NULL on orders | `npm run backfill:workspace-id` |
| Staff sees only own rows | `dataUserId` not resolving to owner | Check `workspace_members` row |
| 404 on order detail | `whereOwnedOrderForOwner` / missing workspace | Backfill + re-login |
| Cross-tenant leak (CRITICAL) | Stop beta — file security incident | `npm run test:security` |

---

## Sign-off

| Role | Name | Date | OK |
|------|------|------|-----|
| Product | | | [ ] |
| QA | | | [ ] |
| Engineering | | | [ ] |
