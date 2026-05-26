# Implementation readiness audit

| Area | Current state | Implementation risk | Customer struggle | Recommended fix | Priority |
|---|---|---:|---|---|---|
| Onboarding | Guided setup + new implementation project | Medium | Hard to know launch order | Use `/dashboard/implementation` checklist | P1 high-impact |
| Import/export | CSV exports + import center | High | Spreadsheets vary by customer | Require CSV preview + error report | P0 implementation blocker |
| Integrations | Woo/Shopify architecture + health page | Medium | Credentials/scopes unclear | Use implementation task + health checks | P1 high-impact |
| Product mapping | New mapping workbench | High | External SKUs do not match menus | Resolve mappings before order import | P0 implementation blocker |
| Customer import | Customer CSV validation + commit | Medium | Duplicate emails/phones | Use dedupe page after import | P1 high-impact |
| Order import | Staged order records | High | Past orders can pollute production | Keep staged until mappings/date checks pass | P0 implementation blocker |
| Menu setup | Existing menus/products | Medium | Weekly menu dates/prices need cleanup | Import products only to active menu | P1 high-impact |
| Fulfillment setup | Storefront + settings | Medium | Pickup/delivery assumptions hidden | Add go-live checklist validation | P1 high-impact |
| Production workflow | Mature production board | Low | Staff need rehearsal | Training + test run | P1 high-impact |
| Packing workflow | Packing/labels available | Medium | Label printer/process unknown | Packing training + label test | P1 high-impact |
| Staff training | New training routes | Medium | Role confusion on launch day | Require training before go-live | P1 high-impact |
| Support docs | Help center exists | Low | White-glove scripts missing | Use implementation service docs | P2 useful |
| Demo data | Demo mode exists | Low | Need practice without live writes | Use training mode + test orders | P2 useful |
| Billing | Trial/plan gates | Medium | Billing owner may be unclear | Go-live checklist billing item | P1 high-impact |
| Plan gates | Monetization registry | Low | Partner/enterprise access needs gating | Partner placeholder gated to Enterprise API | P2 useful |
