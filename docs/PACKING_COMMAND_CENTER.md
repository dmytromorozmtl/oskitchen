# Packing command center

## Route

`/dashboard/packing`

## Query parameters

| Param | Values | Purpose |
|-------|--------|---------|
| `date` | `yyyy-MM-dd` | Packing calendar day (matches production-style parsing). |
| `mode` | `PackingCommandMode` | Generator default + header selector. |
| `fulfillment` | `ALL` \| `PICKUP` \| `DELIVERY` | Narrows **order pipeline** list (tasks remain date-scoped). |

## UI map

1. **Header** — Dynamic title (`packingPageTitle`), subtitle, date + filters + mode.
2. **Generate** — `generatePackingQueueAction` → `services/packing/generate-packing-queue.ts`.
3. **KPI strip** — `lib/packing/packing-kpis.ts`.
4. **Tabs** — Queue, Waves, By customer, By route, By pickup window, Labels, Verification, Exports (`PackingExportsPanel`), Reports link.

## Components

- `components/dashboard/packing-command-center.tsx` — client shell.
- `components/dashboard/packing-client.tsx` — exports-only panel + DTO re-export.
