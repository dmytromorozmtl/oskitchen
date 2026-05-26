# Demo Workspace + Sales Demo Mode — Final (MVP)

## Goals

- KitchenOS looks **alive** in a first meeting.  
- Demo data is **obviously demo**, **resettable**, and **never silently contaminates** a real workspace.

## Modules (target)

- `services/demo/demo-seed-service.ts`  
- `services/demo/demo-reset-service.ts`  
- `lib/demo/demo-scenarios.ts`  
- Public entry: `/demo` — “Launch sales demo”, “Reset demo”, “Switch scenario”.

## Scenarios (content)

Meal prep, café POS, bakery preorder, catering event, ghost kitchen, multi-brand — each should exercise: orders (POS + manual + sample channel), mapping conflict, production, packing, route, support ticket, webhook failure sample (clearly labeled **simulated**).

## Rules

1. Banner: visible, professional, dismissible per session.  
2. Reset: confirm modal + audit.  
3. No fake Stripe charges — use **obvious** demo totals and disabled pay buttons where needed.

## P1

- Scenario switcher persists per browser session; server stores `demoScenario` only on demo tenants.
