# Workspace Scope Audit

Generated: 2026-05-26T00:10:39.895Z

## Summary

- Prisma models total: **362**
- Models with workspaceId: **219**
- Models still needing migration: **0**
- `dataUserId` occurrences sampled: **40**
- Raw `where: { userId` occurrences sampled: **40**

## Classification Guide

- `valid session identity` — session actor handling, auth helpers, or session-only control flow
- `valid legacy alias` — explicit `dataUserId` compatibility while owner-scoped migration is still in progress
- `risky tenant data scope` — direct `where: { userId ... }` patterns on likely tenant data reads/writes
- `migration candidate` — compatibility flags, legacy fallback patterns, or owner-vs-session normalization code

## Valid Session Identity Samples

- `actions/account-deletion.ts:5` — `import { requireSessionUser } from "@/lib/auth";`
- `actions/account-deletion.ts:17` — `const session = await requireSessionUser();`
- `actions/accounting/ap.ts:48` — `const { dataUserId, sessionUserId } = await requireTenantActor();`
- `actions/accounting/ap.ts:50` — `await approveInvoice(invoiceId, dataUserId, sessionUserId);`
- `actions/channel-certification.ts:73` — `where: { id: sessionUser.id },`
- `actions/food-safety.ts:42` — `const { dataUserId, sessionUserId } = await requireTenantActor();`
- `actions/food-safety.ts:48` — `checkedById: sessionUserId,`
- `actions/food-safety.ts:73` — `const { dataUserId, sessionUserId } = await requireTenantActor();`
- `actions/food-safety.ts:80` — `sessionUserId,`
- `actions/food-safety.ts:118` — `const { dataUserId, sessionUserId } = await requireTenantActor();`
- `actions/food-safety.ts:125` — `verifiedById: sessionUserId,`
- `actions/inventory.ts:37` — `const { dataUserId, sessionUserId } = await requireTenantActor();`
- `actions/inventory.ts:43` — `recordedById: sessionUserId,`
- `actions/inventory.ts:49` — `const { dataUserId, sessionUserId } = await requireTenantActor();`
- `actions/inventory.ts:50` — `const count = await countService.startInventoryCount(dataUserId, sessionUserId);`
- `actions/labor/schedule.ts:26` — `const { dataUserId, sessionUserId } = await requireTenantActor();`
- `actions/labor/schedule.ts:33` — `performedById: sessionUserId,`
- `actions/operations.ts:31` — `const { dataUserId, sessionUserId } = await requireTenantActor();`
- `actions/operations.ts:33` — `const audit = await startOperationsAudit(dataUserId, checklistId, sessionUserId);`
- `actions/orders.ts:125` — `performedById: access.actor.sessionUser.id,`
- `actions/platform-impersonation.ts:9` — `import { requireSessionUser } from "@/lib/auth";`
- `actions/platform-impersonation.ts:69` — `const user = await requireSessionUser();`
- `actions/purchasing.ts:42` — `performedById: sessionUser.id,`
- `actions/purchasing.ts:77` — `data: { status: "APPROVED", approvedById: sessionUser.id },`
- `actions/purchasing.ts:83` — `performedById: sessionUser.id,`
- `actions/purchasing.ts:115` — `performedById: sessionUser.id,`
- `actions/settings/avatar.ts:32` — `const path = `avatars/${sessionUser.id}.${ext}`;`
- `actions/settings/email.ts:37` — `where: { id: sessionUser.id },`
- `actions/settings/profile.ts:30` — `where: { id: sessionUser.id },`
- `app/api/compliance/auditor/experiment-controls/route.ts:8` — `import { requireSessionUser } from "@/lib/auth";`
- `app/api/compliance/auditor/experiment-controls/route.ts:16` — `const user = await requireSessionUser();`
- `app/api/dashboard/compliance/experiment-audit-download/route.ts:4` — `import { requireSessionUser } from "@/lib/auth";`
- `app/api/dashboard/compliance/experiment-audit-download/route.ts:11` — `const user = await requireSessionUser();`
- `app/api/dashboard/experiment-publish-preflight/route.ts:3` — `import { requireSessionUser } from "@/lib/auth";`
- `app/api/dashboard/experiment-publish-preflight/route.ts:10` — `const user = await requireSessionUser();`
- `app/api/dashboard/storefront/experiment-series/route.ts:3` — `import { requireSessionUser } from "@/lib/auth";`
- `app/api/dashboard/storefront/experiment-series/route.ts:10` — `const user = await requireSessionUser();`
- `app/api/import-center/[jobId]/errors.csv/route.ts:3` — `import { requireSessionUser } from "@/lib/auth";`
- `app/api/import-center/[jobId]/errors.csv/route.ts:11` — `const user = await requireSessionUser();`
- `app/api/internal/dsr/export/route.ts:4` — `import { requireSessionUser } from "@/lib/auth";`

## Valid Legacy Alias Samples

- `actions/accounting/ap.ts:27` — `const { dataUserId } = await requireTenantActor();`
- `actions/accounting/ap.ts:31` — `await createInvoice(dataUserId, {`
- `actions/accounting/ap.ts:40` — `const { dataUserId } = await requireTenantActor();`
- `actions/accounting/ap.ts:43` — `await matchInvoiceToPO(invoiceId, dataUserId, purchaseOrderId);`
- `actions/accounting/ap.ts:48` — `const { dataUserId, sessionUserId } = await requireTenantActor();`
- `actions/accounting/ap.ts:50` — `await approveInvoice(invoiceId, dataUserId, sessionUserId);`
- `actions/accounting/ap.ts:55` — `const { dataUserId } = await requireTenantActor();`
- `actions/accounting/ap.ts:57` — `await markInvoicePaid(invoiceId, dataUserId);`
- `actions/accounting/bank-reconciliation.ts:28` — `const { dataUserId } = await requireTenantActor();`
- `actions/accounting/bank-reconciliation.ts:51` — `await importBankTransactions(dataUserId, transactions);`
- `actions/accounting/bank-reconciliation.ts:64` — `const { dataUserId } = await requireTenantActor();`
- `actions/accounting/bank-reconciliation.ts:67` — `dataUserId,`
- `actions/accounting/cash.ts:22` — `const { dataUserId } = await requireTenantActor();`
- `actions/accounting/cash.ts:23` — `await submitCashCount(dataUserId, dataUserId, {`
- `actions/accounting/invoice-ocr.ts:9` — `const { dataUserId } = await requireTenantActor();`
- `actions/accounting/invoice-ocr.ts:15` — `const ocr = await processInvoiceWithOCR(buf.toString("base64"), dataUserId);`
- `actions/accounting/invoice-ocr.ts:16` — `const match = await matchInvoiceToPurchaseOrder(dataUserId, ocr);`
- `actions/accounting/pnl.ts:17` — `const { dataUserId } = await requireTenantActor();`
- `actions/accounting/pnl.ts:20` — `await refreshPnlSnapshot(dataUserId, valid);`
- `actions/allergen-profile.ts:22` — `const { sessionUser: user, dataUserId } = await requireTenantActor();`
- `actions/allergen-profile.ts:27` — `where: await productByIdWhereForOwner(dataUserId, productId.data),`
- `actions/allergen-profile.ts:68` — `userId: dataUserId,`
- `actions/analytics.ts:40` — `const { sessionUser: user, dataUserId } = await requireTenantActor();`
- `actions/analytics.ts:41` — `const snap = await createAnalyticsSnapshot({ userId: dataUserId });`
- `actions/analytics.ts:64` — `const { sessionUser: user, dataUserId } = await requireTenantActor();`
- `actions/analytics.ts:89` — `userId: dataUserId,`
- `actions/analytics.ts:98` — `userId: dataUserId,`
- `actions/analytics.ts:117` — `const { sessionUser: user, dataUserId } = await requireTenantActor();`
- `actions/analytics.ts:120` — `const view = await prisma.analyticsSavedView.findFirst({ where: { id, userId: dataUserId } });`
- `actions/analytics.ts:125` — `userId: dataUserId,`
- `actions/analytics.ts:163` — `const { sessionUser: user, dataUserId } = await requireTenantActor();`
- `actions/analytics.ts:171` — `where: { userId_type: { userId: dataUserId, type: parsed.data.type } },`
- `actions/analytics.ts:172` — `create: { userId: dataUserId, type: parsed.data.type, enabled },`
- `actions/analytics.ts:195` — `const { sessionUser: user, dataUserId } = await requireTenantActor();`
- `actions/analytics.ts:205` — `? await buildRevenueCsv({ userId: dataUserId }, filters)`
- `actions/analytics.ts:206` — `: await buildOrdersCsv({ userId: dataUserId }, filters);`
- `actions/analytics.ts:209` — `userId: dataUserId,`
- `actions/audit-center.ts:32` — `const { sessionUser: user, dataUserId } = await requireTenantActor();`
- `actions/audit-center.ts:45` — `userId: dataUserId,`
- `actions/audit-center.ts:161` — `const { sessionUser: user, dataUserId } = await requireTenantActor();`

## Risky Tenant Data Scope Samples

- `actions/channel-command-center.ts:168` — `where: { userId: dataUserId },`
- `actions/channel-command-center.ts:171` — `where: { userId: dataUserId },`
- `actions/costing.ts:51` — `const kitchen = await prisma.kitchenSettings.findUnique({ where: { userId: dataUserId } });`
- `actions/costing.ts:97` — `where: { userId: dataUserId },`
- `actions/customers.ts:565` — `where: { userId },`
- `actions/demo.ts:64` — `where: { userId: dataUserId },`
- `actions/demo.ts:71` — `where: { userId: dataUserId },`
- `actions/experiment-ethics-review.ts:47` — `const sf = await prisma.storefrontSettings.findFirst({ where: { userId: dataUserId  }, orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],`
- `actions/growth.ts:199` — `where: { userId: dataUserId },`
- `actions/growth.ts:214` — `where: { userId: user.id, active: true },`
- `actions/implementation.ts:394` — `where: { userId: dataUserId, customerId: { in: mergedCustomerIds } },`
- `actions/implementation.ts:430` — `prisma.staffMember.count({ where: { userId: dataUserId, active: true } }),`
- `actions/label-print-queue.ts:106` — `const count = await prisma.labelTemplate.count({ where: { userId: dataUserId } });`
- `actions/marketing/holiday-packages.ts:39` — `where: { userId: dataUserId },`
- `actions/menus.ts:255` — `const sf = await prisma.storefrontSettings.findFirst({ where: { userId: dataUserId  }, orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],`
- `actions/monetization.ts:30` — `const sub = await prisma.subscription.findUnique({ where: { userId: dataUserId } });`
- `actions/monetization.ts:67` — `where: { userId: dataUserId },`
- `actions/monetization.ts:73` — `where: { userId: dataUserId },`
- `actions/notification-rules.ts:40` — `const existing = await prisma.notificationRule.count({ where: { userId: dataUserId } });`
- `actions/nutrition-label-settings.ts:20` — `where: { userId: dataUserId },`
- `actions/nutrition-label-settings.ts:37` — `where: { userId: dataUserId },`
- `actions/onboarding.ts:110` — `where: { userId },`
- `actions/onboarding.ts:140` — `where: { userId },`
- `actions/onboarding.ts:179` — `where: { userId: dataUserId },`
- `actions/onboarding.ts:236` — `where: { userId: dataUserId },`
- `actions/onboarding.ts:284` — `where: { userId: dataUserId },`
- `actions/onboarding.ts:462` — `await prisma.orderChannel.deleteMany({ where: { userId: dataUserId } });`
- `actions/onboarding.ts:571` — `where: { userId: dataUserId },`
- `actions/onboarding.ts:623` — `where: { userId: dataUserId },`
- `actions/operating-mode.ts:22` — `where: { userId: dataUserId },`
- `actions/orders.ts:148` — `where: { userId },`
- `actions/orders.ts:257` — `where: { userId },`
- `actions/orders.ts:355` — `where: { userId },`
- `actions/orders.ts:387` — `where: { userId },`
- `actions/platform-impersonation.ts:35` — `where: { userId: targetUserId },`
- `actions/playbooks.ts:79` — `where: { userId: dataUserId },`
- `actions/products.ts:24` — `const sf = await prisma.storefrontSettings.findFirst({ where: { userId  }, orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],`
- `actions/settings-center.ts:143` — `where: { userId: actor.userId },`
- `actions/settings-center.ts:301` — `where: { userId: actor.userId },`
- `actions/settings-center.ts:492` — `where: { userId: actor.userId },`

## Migration Candidate Samples

- `actions/catering.ts:50` — `// Use the new Command Center service so legacy creates show up in the`
- `actions/delivery-route.ts:44` — `/* ----------------------------- legacy preserved ----------------------------- */`
- `actions/kitchen-task.ts:48` — `/* ============================ legacy preserved ============================ */`
- `actions/locations.ts:47` — `/* ============================ legacy preserved ============================ */`
- `app/api/export/report/route.ts:14` — `* Filtered Reports Center export endpoint. The legacy `/api/export``
- `app/dashboard/brands/templates/page.tsx:62` — `wizard. Customize after creation — nothing migrates legacy records automatically.`
- `app/dashboard/catering-quotes/[quoteId]/page.tsx:334` — `<Label htmlFor="d-notes">Legacy notes</Label>`
- `app/dashboard/catering-quotes/new/page.tsx:234` — `<Label htmlFor="notes">Legacy notes field</Label>`
- `app/dashboard/go-live/page.tsx:71` — `// Preserve the legacy checklist for first-time visitors.`
- `app/dashboard/go-live/page.tsx:131` — `<CardTitle className="text-base">Legacy checklist</CardTitle>`
- `app/dashboard/import-export/export/page.tsx:12` — `orders: { title: "Orders", description: "Latest orders with fulfillment metadata (legacy cap 5k)." },`
- `app/dashboard/import-export/export/page.tsx:43` — `PDF variants will extend this surface without breaking legacy query parameters.`
- `app/dashboard/import-export/exports/page.tsx:37` — `<p className="mt-2 max-w-2xl text-muted-foreground">Recorded downloads (including legacy `/api/export` links).</p>`
- `app/dashboard/import-export/page.tsx:81` — `for backups, finance extracts, and channel migrations. Legacy session-cookie URLs under{" "}`
- `app/dashboard/import-export/page.tsx:96` — `<CardTitle className="text-lg">Legacy CSV exports</CardTitle>`
- `app/dashboard/meal-plans/page.tsx:47` — `// Mirror any legacy CustomerSubscription rows once so the new center reflects them.`
- `app/dashboard/meal-plans/page.tsx:96` — `Sync legacy subscriptions`
- `app/dashboard/meal-plans/settings/page.tsx:29` — `<p><strong>Legacy subscriptions:</strong> {legacyCount}</p>`
- `app/dashboard/meal-plans/settings/page.tsx:70` — `<CardTitle className="text-base">Legacy / migration</CardTitle>`
- `app/dashboard/meal-plans/settings/page.tsx:74` — `The legacy <code>/dashboard/meal-subscriptions</code> page is preserved as-is for backwards`
- `app/dashboard/meal-subscriptions/page.tsx:30` — `<h1 className="text-3xl font-semibold tracking-tight">Meal subscriptions (legacy)</h1>`
- `app/dashboard/notifications/rules/page.tsx:27` — `Bind triggers to templates and timing offsets. The legacy `kitchen_settings` toggles`
- `app/dashboard/nutrition-labels/items/[productId]/page.tsx:169` — `<Label>Ingredient declaration (legacy field on nutrition profile)</Label>`
- `app/dashboard/nutrition-labels/items/[productId]/page.tsx:177` — `<Label>Allergens (legacy text; prefer structured allergen profile)</Label>`
- `app/dashboard/order-hub/page.tsx:265` — `<span className="text-muted-foreground">Legacy SF</span>`
- `app/dashboard/purchasing/page.tsx:167` — `{dash.ingredientsMissingSupplier} ingredients have no legacy supplier label — assign suppliers so PO drafts`
- `app/dashboard/reports/[reportKey]/page.tsx:95` — `Legacy export`
- `app/dashboard/reports/library/page.tsx:143` — `Legacy export`
- `app/dashboard/reports/settings/page.tsx:57` — `<CardTitle className="text-base">Legacy exports preserved</CardTitle>`
- `app/dashboard/sales-channels/health/page.tsx:53` — `<Link href="/dashboard/integrations/health">Legacy URL</Link>`
- `app/dashboard/sales-channels/webhooks/page.tsx:56` — `<Link href="/dashboard/integrations/webhooks">Legacy URL</Link>`
- `app/dashboard/sales-channels/webhooks/page.tsx:100` — `Same ingestion log as legacy route — raw payloads stay server-side; never copy`
- `app/dashboard/settings/workspace/page.tsx:64` — `<CardTitle className="text-base">Legacy workflow preferences</CardTitle>`
- `app/dashboard/storefront/forms/page.tsx:67` — `<option value="">Legacy built-in contact</option>`
- `app/dashboard/storefront/forms/page.tsx:85` — `<option value="">Legacy built-in catering</option>`
- `app/dashboard/training/page.tsx:22` — `{ title: "Kitchen staff (legacy)", href: "/dashboard/training/kitchen", desc: "Production board, kitchen screen, batch quantities." },`
- `app/dashboard/training/page.tsx:23` — `{ title: "Packing staff (legacy)", href: "/dashboard/training/packing", desc: "Packing verification, labels, exceptions." },`
- `app/dashboard/training/page.tsx:24` — `{ title: "Manager (legacy)", href: "/dashboard/training/manager", desc: "Order hub, menu planner, reports, issue triage." },`
- `app/dashboard/training/page.tsx:163` — `<CardTitle className="text-base">Legacy walkthroughs</CardTitle>`
- `app/dashboard/training/practice/page.tsx:21` — `routes, labels, and inventory movements are surfaced to trainees through the legacy walkthroughs`

## Workspace-First Scope Samples

- `actions/audit-center.ts:90` — `where: { workspaceId: primaryWorkspaceId },`
- `actions/audit-center.ts:157` — `const wsId = input.filters.workspaceId && scope.ownedWorkspaceIds.includes(input.filters.workspaceId)`
- `actions/audit-center.ts:158` — `? input.filters.workspaceId`
- `actions/audit-center.ts:164` — `workspaceId: wsId,`
- `actions/audit-center.ts:187` — `where: { workspaceId: wsId },`
- `actions/audit-center.ts:189` — `workspaceId: wsId,`
- `actions/audit-center.ts:200` — `workspaceId: wsId,`
- `actions/audit-center.ts:222` — `const row = await prisma.auditRetentionPolicy.findUnique({ where: { workspaceId: wsId } });`
- `actions/brands.ts:190` — `workspaceId: workspace.id,`
- `actions/brands.ts:312` — `workspaceId: brand.workspaceId,`
- `actions/brands.ts:349` — `workspaceId: brand.workspaceId,`
- `actions/channel-command-center.ts:338` — `const workspaceId = await resolveOwnerWorkspaceId(dataUserId);`
- `actions/channel-command-center.ts:342` — `workspaceId: workspaceId ?? undefined,`
- `actions/channel-command-center.ts:373` — `workspaceId,`
- `actions/channel-command-center.ts:390` — `workspaceId,`
- `actions/channel-command-center.ts:430` — `const workspaceId = await resolveOwnerWorkspaceId(dataUserId);`
- `actions/channel-command-center.ts:434` — `workspaceId,`
- `actions/growth.ts:197` — `const workspaceId = await ensureOwnerWorkspaceId(dataUserId);`
- `actions/growth.ts:200` — `create: { userId: dataUserId, workspaceId, checklistDismissed: true },`
- `actions/growth.ts:201` — `update: { workspaceId, checklistDismissed: true },`
- `actions/implementation.ts:110` — `const { sessionUser: user, dataUserId, workspaceId } = await requireTenantActor();`
- `actions/implementation.ts:134` — `const { sessionUser: user, dataUserId, workspaceId } = await requireTenantActor();`
- `actions/implementation.ts:146` — `workspaceId: workspaceId ?? undefined,`
- `actions/implementation.ts:195` — `const { sessionUser: user, dataUserId, workspaceId } = await requireTenantActor();`
- `actions/implementation.ts:213` — `workspaceId,`
- `actions/implementation.ts:258` — `const workspaceId = await resolveOwnerWorkspaceId(dataUserId);`
- `actions/implementation.ts:262` — `workspaceId: workspaceId ?? undefined,`
- `actions/implementation.ts:294` — `const { sessionUser: user, dataUserId, workspaceId } = await requireTenantActor();`
- `actions/implementation.ts:320` — `...(workspaceId ? { workspaceId } : {}),`
- `actions/implementation.ts:329` — `workspaceId: workspaceId ?? undefined,`
- `actions/implementation.ts:349` — `const { sessionUser: user, dataUserId, workspaceId } = await requireTenantActor();`
- `actions/implementation.ts:373` — `const { sessionUser: user, dataUserId, workspaceId } = await requireTenantActor();`
- `actions/implementation.ts:419` — `const { sessionUser: user, dataUserId, workspaceId } = await requireTenantActor();`
- `actions/ingredient-declaration.ts:35` — `const workspaceId = await resolveOwnerWorkspaceId(dataUserId);`
- `actions/ingredient-declaration.ts:41` — `workspaceId,`
- `actions/integrations.ts:37` — `const workspaceId = await resolveOwnerWorkspaceId(access.actor.dataUserId);`
- `actions/integrations.ts:38` — `return { ok: true as const, actor: access.actor, workspaceId };`
- `actions/integrations.ts:46` — `const workspaceId = gate.workspaceId;`
- `actions/integrations.ts:109` — `workspaceId: existing.workspaceId ?? workspaceId,`
- `actions/integrations.ts:121` — `workspaceId,`

## Models Still Needing Migration

- none

## Recommended Plan

1. Keep `workspaceId` as the preferred tenant data boundary for all new work.
2. Treat `dataUserId` as a temporary compatibility alias, not a destination architecture.
3. Burn down raw `where: { userId` patterns with scope helpers before removing legacy fallback support.
4. Add an ESLint or static-audit warning for new `dataUserId` usage outside explicit tenant helpers.
5. Target a 30-day deprecation review for remaining `WORKSPACE_SCOPE_LEGACY_OR` / alias-heavy paths.

## Output Consumers

- engineering architecture review
- tenant isolation QA
- pilot readiness / production hardening
- future `dataUserId` deprecation plan
