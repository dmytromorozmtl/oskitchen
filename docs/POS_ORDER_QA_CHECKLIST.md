# POS order QA checklist

1. **POS walk-in pickup** — checkout without customer email → no `NEEDS_FULFILLMENT_INFO` solely for missing `pickupDate`; stage moves toward kitchen readiness; tab shows “Pickup now”.
2. **POS → PREPARING** — allowed without pickup date for pickup-now; blocked when `requiresScheduledServiceDate` true and date missing.
3. **Weekly preorder** — still requires `pickupDate` before production (no regression).
4. **Guest email** — header does not show `@local.kitchenos.invalid` in subtitle; customer tab messaging OK.
5. **Branches** — `NEEDS_FULFILLMENT_SCHEDULING` appears instead of `NEEDS_PRODUCTION` when date required and missing.
6. **Routing card** — pickup orders show explanation, not “broken” empty list.
7. **Items tab** — ops route column populated; explanations sensible vs production work items.
8. **Activity** — human-readable titles for POS events.
9. **Navigation** — Commerce group has no duplicate Weekly menus link.
10. **Platform workspace** — POS diagnostics section renders counts.

Automated: `npm run typecheck`, `npm run build` (pass on 2026-05-14).
