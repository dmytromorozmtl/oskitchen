# Commercial MVP readiness checklist

- [ ] Registration + email flows operational in production config  
- [ ] Onboarding captures business type + timezone + currency (`kitchenSettings`)  
- [ ] Public marketing pages load with accurate positioning (`docs/MARKETING_SITE_REPOSITIONING.md`)  
- [ ] User can create manual order (`/dashboard/orders/new`)  
- [ ] Order lifecycle view matches operator reality (`ORDER_LIFECYCLE_ENGINE.md`)  
- [ ] Order hub triage (`/dashboard/order-hub`)  
- [ ] Product mapping resolves channel lines (`/dashboard/product-mapping`)  
- [ ] Today command center (`/dashboard/today`)  
- [ ] Production + packing + routes happy paths  
- [ ] CRM profile + consent flags honored  
- [ ] Analytics / executive overview renders  
- [ ] Support inbox usable (`/dashboard/support/*`)  
- [ ] Platform admin gated (`/platform/*`)  
- [ ] Billing safe (Stripe test vs live separation)  
- [ ] Notifications respect settings  
- [ ] Audit logs accessible to admins  
- [ ] RBAC smoke tests for packer/driver roles  
- [ ] No secrets in client bundles  
- [ ] `npm run typecheck` + `npm run build` green on release branch  

## Honest estimate

**Commercial SMB MVP:** 3–6 engineering weeks after P1 items above are fully green in staging.  
**Enterprise pilot:** +6–12 weeks (SSO, DPA workflow, SLO reporting, deeper RBAC).
