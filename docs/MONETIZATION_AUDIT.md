# Monetization audit — OS Kitchen

Each row lists **current state**, **revenue risk**, **recommended improvement**, and **priority**.

**Priorities:** P0 revenue blocker · P1 conversion · P2 retention · P3 future.

| Area | Current state | Revenue risk | Recommended improvement | Priority |
|------|----------------|--------------|-------------------------|----------|
| Pricing page | Dedicated **`/pricing`** with tiers, annual toggle placeholder, comparison, FAQ | Prospects anchor on homepage anchors only | Link `/pricing` from marketing + app shell | P1 |
| Billing logic | Stripe Checkout + portal + subscription webhook sync | Misconfigured env blocks upgrade | Keep graceful 503 + owner messaging | P0 |
| Plan limits | `lib/plans.ts` + integration with menus/orders | Silent overages erode trust | Surface usage meters on billing panel | P1 |
| Feature gates | `lib/plans/feature-registry.ts` + `PlanGate` on premium modules | Wrong tier accesses Uber lanes | Expand gates to risky mutations server-side | P1 |
| Upgrade prompts | Upgrade gate cards + billing banner | Low discoverability | Contextual “unlock Pro” on gated saves | P2 |
| Usage tracking | `UsageEvent` + growth dashboards | Limited funnel analytics | Tie lifecycle emails to usage thresholds | P2 |
| Trial experience | `TrialState` 14-day window + banner + billing redirect | Abrasive lockout | Add grace read-only window option | P2 |
| Onboarding path | Wizard + activation checklist | Drop-offs unseen | Lifecycle automation hooks added | P1 |
| Activation | Checklist card + events | Unclear next step | Surface checklist in email sequence | P2 |
| Retention triggers | Customer success board + retention snapshot helper | Reactive only | Cron jobs for login + webhook failures | P2 |
| Cancellation | `/dashboard/billing/cancel` + feedback model | Unknown churn drivers | Review feedback weekly | P1 |
| Enterprise / sales | Mailto + `/book-demo` | Pipeline opaque | CRM logging already in Growth | P2 |
