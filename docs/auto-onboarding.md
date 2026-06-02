# Automated onboarding

AI-assisted setup: **5 questions** → proposed configuration → owner **reviews and confirms** → restaurant ready.

## Questions

1. Cuisine / concept (10 template cards)
2. Seat count
3. Delivery or dine-in focus
4. Average order value
5. Special requirements + business name

## What gets configured

| Area | Action |
|------|--------|
| Menu | Template from `menu-templates.ts` (+ first signature item) |
| KDS | Workflow from operating model |
| Modules | POS, QR, website, delivery based on answers |
| Tax | Default rate from concept / special requirements |
| Suppliers | Up to 3 approved marketplace vendors (suggestions only) |

## Routes

- Wizard: `/dashboard/onboarding/auto`
- Service: `services/onboarding/auto-onboarding-service.ts`

## Competitor comparison

| Product | Time to first order |
|---------|---------------------|
| Toast | Days + installer |
| Square | Hours, manual menu |
| **OS Kitchen** | **~15 min after 5 questions** |

## Sales pitch

> "Answer five questions. Our AI-assisted agent builds your menu, kitchen screen, and channels — you tap confirm and take your first order."
