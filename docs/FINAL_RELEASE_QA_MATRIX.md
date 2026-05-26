# Final Release QA Matrix

## Business types

Meal prep · Café · Bakery · Catering · Ghost kitchen · Multi-brand · Manual-only.

## Personas

Owner · Manager · Cashier · Kitchen lead · Packer · Driver · Customer service · Accountant · Platform founder · Platform support admin · Platform billing admin.

## Workflows (must pass)

1. Registration  
2. Adaptive onboarding / business type selection  
3. POS cash / external terminal path  
4. POS made-to-order  
5. POS ready-now  
6. Manual order  
7. Scheduled pickup  
8. Delivery order  
9. Imported order w/ mapping issue  
10. Mapping approval clears blockers  
11. Send to production (guards)  
12. Complete production  
13. Packing verification  
14. Route assignment  
15. CRM update / guest email handling  
16. Customer support ticket  
17. Platform reply (internal vs external)  
18. `/dashboard/integration-health` shows honest statuses + failed webhooks visible  
19. Error recovery retry (where implemented)  
20. Data integrity flags  
21. Demo import + reset (confirm-gated)  
22. Marketing CTAs (`/`, `/demo`, `/book-demo`)  
23. RBAC denial (staff vs billing)  
24. Platform denial for workspace-only users  
25. Audit redaction spot-check  

## Automation

`npm run typecheck` · `npm run build` · `npm run lint` · `npm test`
