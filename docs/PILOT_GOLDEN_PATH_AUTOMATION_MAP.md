# Golden path — manual vs automated coverage

| Checklist ID | Manual checklist | Automated |
|--------------|------------------|-----------|
| A1.1 Login | `PILOT_GOLDEN_PATH_CHECKLIST.md` | `e2e/pilot-auth.setup.ts` |
| A1.2 Kitchen settings | Manual | — |
| A1.3 Menus + products | Manual create | `pilot-journey.spec.ts` menus load |
| A1.4 Nutrition command center | Manual | `pilot-journey.spec.ts` `/nutrition-labels` |
| A1.5–A1.6 Print queue | Manual queue/print | `pilot-journey.spec.ts` print-queue load |
| A2.x Orders/production/packing | Manual | `pilot-journey.spec.ts` orders, hub, production, packing |
| A3 Storefront/channels | Manual checkout | sales-channels, import-center |
| A4 Import/export | Manual CSV | import-center load |
| B1–B5 Staff | **Required manual** + invite | `pilot-journey-staff.spec.ts` when `E2E_PILOT_STAFF_*` set |
| C1 IDOR URL | Manual | `tests/e2e/remediation-delivery-idor.spec.ts` (Closed Beta Gate) |
| C2 Cron 401 | Manual | `npm run smoke:golden-path-http` |
| C3 Marketing claims | Manual spot-check | `npm run verify-claims` |

**Staff prerequisite:** `npm run pilot:next-step` → staff step, or `npm run smoke:team-invites`.
