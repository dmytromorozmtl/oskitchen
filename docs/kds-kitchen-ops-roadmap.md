# KDS And Kitchen Operations Roadmap

Status: phased path from current production/packing foundations to restaurant-grade kitchen orchestration
Primary evidence: `services/pos/pos-kitchen-routing-service.ts`, `services/kitchen-screen/kitchen-screen-service.ts`, `actions/kitchen-daily-kds.ts`, `actions/production.ts`, `actions/packing.ts`, `actions/packing-verification.ts`, `app/api/cron/kds-overdue-alerts/route.ts`, `docs/KITCHEN_SCREEN_ARCHITECTURE.md`, `docs/system-reality-model.md`

## Strategic Goal
Build a kitchen system that is more valuable than generic POS KDS by connecting live order routing, prep, packing, fulfillment, and post-service analytics in one platform.

## Capability Roadmap
| Capability bundle | Current state | Gap | Model changes | Service changes | UI changes | Permission checks | Audit logs | Tests | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| station routing, station config, item routing, category routing, modifier routing, course routing | POS kitchen routing exists, but station model is fragmented | no canonical station config and routing rule system | station, routing rule, station membership entities | unify routing in kitchen services | station admin UI and readable assignment states | `kitchen.configure` | routing config changes | routing unit/integration tests | station routing is deterministic and editable |
| hold/fire, course firing | notes and kitchen routing foundations exist | no mature restaurant service-line orchestration | item course and hold state fields | hold/fire orchestration service | fire/hold controls for server and expo | `kitchen.expo.manage`, `orders.update` | hold/fire events | course/hold tests | kitchen and FOH can coordinate timed firing |
| item bumping, order bumping, recall ticket, rush ticket | kitchen screen foundations exist | no certified live-service bump/recall workflow | ticket/item action states | KDS action service with idempotent transitions | large readable ticket actions | `kitchen.bump`, `kitchen.recall` | bump/recall/rush audit | realtime KDS tests | kitchen can work tickets in real service safely |
| allergy warning, modifier highlighting | allergy data exists in order/storefront flows | not surfaced as a strong kitchen safety control | order item warning metadata | warning resolver service | high-contrast alerts and modifier emphasis | `kitchen.view` | allergy acknowledgement events where needed | allergen warning tests | high-risk tickets stand out immediately |
| SLA timers, late warnings, color urgency | overdue cron exists | no full SLA/timer framework | SLA target fields and timer snapshots | timer/signal service + cron integration | readable urgency states from distance | `kitchen.view` | timer escalation audit | SLA timer tests | owner/expo can see bottlenecks clearly |
| kitchen fullscreen, kitchen tablet | kitchen-screen mode exists in pieces | needs a dedicated production-grade display shell | none initially | optimize live query/update service | fullscreen/tablet KDS shell | `kitchen.view` | minimal | visual + responsiveness tests | kitchen display is readable at distance |
| expo screen | no mature expo role product yet | coordination workflow missing | expo-specific station/command states | expo orchestration service | expo dashboard and cross-station controls | `kitchen.expo.manage` | expo assignment actions | expo flow tests | expo can coordinate and recover tickets |
| packing station, packing verification | packing and verification are strong foundations | needs tighter kitchen-to-packing handoff | packing checkpoint state linkage | handoff service between KDS and packing | clearer ready/packed/verified surfaces | `kitchen.view`, packing permissions | handoff and verification audit | packing verification E2E | packing staff can verify orders accurately |
| label printing | printing/export foundations exist | no certified kitchen label workflow | label queue/print attempt rows | label queue service integration | print queue controls | `kitchen.configure` or future print permission | print attempt logs | label print tests | labels can be queued and audited safely |
| prep batches, production planning | production services exist | more restaurant-prep planning depth required | prep batch entities and forecast ties | prep planning service | prep planner UI | `inventory.manage`, `kitchen.configure` | prep plan audit | prep batch tests | prep teams can plan tomorrow’s work |
| production forecast | forecast surfaces exist | forecast-to-kitchen execution connection is partial | forecast snapshot to station/prep linkage | forecasting integration into kitchen planning | prep forecast panels | `analytics.view`, `kitchen.configure` | forecast run audit | forecast tests | prep forecast informs production planning |
| waste logging | waste logging exists under inventory | kitchen workflow is not tightly connected | none initially | kitchen-side waste entry integration | quick waste log actions | `inventory.adjust` or `inventory.manage` | waste entry audit | waste tests | waste can be logged from live kitchen context |
| kitchen performance report | analytics/reporting exists broadly | kitchen-specific throughput/SLA reporting not packaged | station SLA/event rollups | reporting service slices | kitchen analytics dashboards | `reports.view`, `analytics.view` | report export audit | kitchen report tests | owner sees bottlenecks and station performance |
| real-time updates | foundations exist but are not documented as certified | live-service confidence needs proof | event sequencing or state snapshots as needed | realtime event transport and retry discipline | stable live ticket updates | `kitchen.view` | event anomaly audit | realtime integration tests | kitchen state updates in near-real time |
| offline fallback | not production-certified | degraded mode strategy missing | optional local queue/state model if approved | replay/consistency service | degraded mode warnings and restrictions | `kitchen.bump` with guarded fallback | replay logs | offline KDS tests | kitchen fails safely and clearly |
| permission checks | central kitchen permission keys do not yet exist in code | no canonical server-side kitchen auth model | permission registry changes | route/mutation permission helpers | permission-denied states | `kitchen.view`, `kitchen.bump`, `kitchen.recall`, `kitchen.configure`, `kitchen.expo.manage` | denial audit logs | role-negative kitchen tests | unauthorized users cannot mutate kitchen state |
| audit logs | audit infra exists | kitchen actions need consistent event taxonomy | action taxonomy only | KDS audit writer integration | none beyond history views | same as above | bump/recall/config/escalation events | audit coverage tests | kitchen state changes are reconstructable |

## Delivery Sequence
1. Canonical kitchen permissions and bump/recall state machine
2. Station configuration and routing rules
3. SLA timers, urgency, and distance-readable KDS shell
4. Expo and packing handoff integration
5. Prep planning, forecast linkage, and kitchen performance reports
6. Offline/degraded strategy only after live-service online flow is trustworthy

## Acceptance Bar
- kitchen staff can run live service
- expo can coordinate stations
- packing staff can verify orders
- owner can see bottlenecks
- KDS is readable from distance
- unauthorized users cannot mutate kitchen state

## Product Guardrails
- Do not market KDS as live-service certified until bump/recall, permissions, and readability standards are complete.
- Do not build kitchen UX independently from the shared order spine.
- Keep allergy, modifier, and urgency cues server-derived wherever possible.
