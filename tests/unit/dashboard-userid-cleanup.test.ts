import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(rel: string) {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("dashboard userId-first cleanup", () => {
  it("removes legacy dataUserId usage from the selected dashboard bundle", () => {
    const files = [
      "app/dashboard/billing/page.tsx",
      "app/dashboard/menus/page.tsx",
      "app/dashboard/storefront/page.tsx",
      "app/dashboard/notifications/page.tsx",
      "app/dashboard/notifications/log/page.tsx",
      "app/dashboard/notifications/settings/page.tsx",
      "app/dashboard/notifications/alerts/page.tsx",
      "app/dashboard/notifications/rules/page.tsx",
      "app/dashboard/notifications/preferences/page.tsx",
      "app/dashboard/notifications/retry/page.tsx",
      "app/dashboard/notifications/templates/page.tsx",
      "app/dashboard/integrations/uber-eats/page.tsx",
      "app/dashboard/integrations/shopify/page.tsx",
      "app/dashboard/integrations/health/page.tsx",
      "app/dashboard/integrations/webhooks/page.tsx",
      "app/dashboard/integrations/homebase/page.tsx",
      "app/dashboard/integrations/doordash/page.tsx",
      "app/dashboard/integrations/7shifts/page.tsx",
      "app/dashboard/integrations/grubhub/page.tsx",
      "app/dashboard/integrations/uber-direct/page.tsx",
      "app/dashboard/integrations/woocommerce/page.tsx",
      "app/dashboard/routes/page.tsx",
      "app/dashboard/routes/planner/page.tsx",
      "app/dashboard/routes/[routeId]/page.tsx",
      "app/dashboard/routes/reports/page.tsx",
      "app/dashboard/routes/drivers/page.tsx",
      "app/dashboard/routes/driver/page.tsx",
      "app/dashboard/routes/uber-direct/page.tsx",
      "app/dashboard/routes/fleet/page.tsx",
      "app/dashboard/routes/zones/page.tsx",
      "app/dashboard/routes/[routeId]/driver/page.tsx",
      "app/dashboard/routes/[routeId]/manifest/page.tsx",
      "app/dashboard/system-health/page.tsx",
      "app/dashboard/system-health/incidents/page.tsx",
      "app/dashboard/system-health/data-integrity/page.tsx",
      "app/dashboard/error-recovery/page.tsx",
      "app/dashboard/operations/audits/[auditId]/page.tsx",
      "app/dashboard/sales-channels/page.tsx",
      "app/dashboard/sales-channels/attention/page.tsx",
      "app/dashboard/sales-channels/available/page.tsx",
      "app/dashboard/sales-channels/analytics/page.tsx",
      "app/dashboard/sales-channels/conflicts/page.tsx",
      "app/dashboard/sales-channels/connected/page.tsx",
      "app/dashboard/sales-channels/connections/[connectionId]/page.tsx",
      "app/dashboard/sales-channels/handoff/page.tsx",
      "app/dashboard/sales-channels/health/page.tsx",
      "app/dashboard/sales-channels/imports/[batchId]/page.tsx",
      "app/dashboard/sales-channels/mapping/page.tsx",
      "app/dashboard/sales-channels/reliability/page.tsx",
      "app/dashboard/sales-channels/rules/page.tsx",
      "app/dashboard/sales-channels/staging/page.tsx",
      "app/dashboard/sales-channels/sync-jobs/page.tsx",
      "app/dashboard/sales-channels/webhooks/page.tsx",
      "app/dashboard/locations/page.tsx",
      "app/dashboard/locations/layout.tsx",
      "app/dashboard/locations/settings/page.tsx",
      "app/dashboard/locations/active/page.tsx",
      "app/dashboard/locations/setup/page.tsx",
      "app/dashboard/locations/new/page.tsx",
      "app/dashboard/locations/reports/page.tsx",
      "app/dashboard/locations/assignment/page.tsx",
      "app/dashboard/locations/[locationId]/layout.tsx",
      "app/dashboard/locations/[locationId]/page.tsx",
      "app/dashboard/locations/[locationId]/hours/page.tsx",
      "app/dashboard/locations/[locationId]/fulfillment/page.tsx",
      "app/dashboard/locations/[locationId]/orders/page.tsx",
      "app/dashboard/locations/[locationId]/menus/page.tsx",
      "app/dashboard/locations/[locationId]/routes/page.tsx",
      "app/dashboard/locations/[locationId]/production/page.tsx",
      "app/dashboard/locations/[locationId]/inventory/page.tsx",
      "app/dashboard/locations/[locationId]/settings/page.tsx",
      "app/dashboard/locations/[locationId]/reports/page.tsx",
      "app/dashboard/locations/[locationId]/profile/page.tsx",
      "app/dashboard/locations/[locationId]/brands/page.tsx",
      "app/dashboard/meal-plans/page.tsx",
      "app/dashboard/meal-plans/new/page.tsx",
      "app/dashboard/meal-plans/[planId]/page.tsx",
      "app/dashboard/meal-plans/reports/page.tsx",
      "app/dashboard/meal-plans/active/page.tsx",
      "app/dashboard/meal-plans/paused/page.tsx",
      "app/dashboard/meal-plans/cycles/page.tsx",
      "app/dashboard/meal-plans/templates/page.tsx",
      "app/dashboard/meal-plans/customers/page.tsx",
      "app/dashboard/meal-plans/needs-review/page.tsx",
      "app/dashboard/meal-plans/generated/page.tsx",
      "app/dashboard/meal-plans/settings/page.tsx",
      "app/dashboard/tasks/page.tsx",
      "app/dashboard/tasks/new/page.tsx",
      "app/dashboard/tasks/[taskId]/page.tsx",
      "app/dashboard/tasks/kanban/page.tsx",
      "app/dashboard/tasks/settings/page.tsx",
      "app/dashboard/tasks/templates/page.tsx",
      "app/dashboard/tasks/calendar/page.tsx",
      "app/dashboard/tasks/reports/page.tsx",
      "app/dashboard/tasks/recurring/page.tsx",
      "app/dashboard/tasks/list/page.tsx",
      "app/dashboard/tasks/my/page.tsx",
      "app/dashboard/customers/page.tsx",
      "app/dashboard/customers/list/page.tsx",
      "app/dashboard/customers/reports/page.tsx",
      "app/dashboard/customers/at-risk/page.tsx",
      "app/dashboard/customers/vip/page.tsx",
      "app/dashboard/customers/allergies/page.tsx",
      "app/dashboard/customers/follow-ups/page.tsx",
      "app/dashboard/customers/dedupe/page.tsx",
      "app/dashboard/customers/deduplication/page.tsx",
      "app/dashboard/customers/segments/page.tsx",
      "app/dashboard/customers/companies/page.tsx",
      "app/dashboard/customers/loyalty/page.tsx",
      "app/dashboard/customers/churn-risk/page.tsx",
      "app/dashboard/customers/feedback/page.tsx",
      "app/dashboard/customers/[customerId]/page.tsx",
      "app/dashboard/copilot/page.tsx",
      "app/dashboard/copilot/insights/page.tsx",
      "app/dashboard/copilot/audit/page.tsx",
      "app/dashboard/copilot/settings/page.tsx",
      "app/dashboard/copilot/summaries/page.tsx",
      "app/dashboard/copilot/drafts/page.tsx",
      "app/dashboard/copilot/sources/page.tsx",
      "app/dashboard/copilot/chat/page.tsx",
      "app/dashboard/reports/page.tsx",
      "app/dashboard/reports/library/page.tsx",
      "app/dashboard/reports/[reportKey]/page.tsx",
      "app/dashboard/reports/financial/page.tsx",
      "app/dashboard/reports/executive/page.tsx",
      "app/dashboard/reports/operations/page.tsx",
      "app/dashboard/reports/saved/page.tsx",
      "app/dashboard/reports/history/page.tsx",
      "app/dashboard/reports/settings/page.tsx",
      "app/dashboard/reports/enterprise/page.tsx",
      "app/dashboard/reports/menu-engineering/page.tsx",
      "app/dashboard/reports/financial/pnl/page.tsx",
      "app/dashboard/implementation/layout.tsx",
      "app/dashboard/implementation/page.tsx",
      "app/dashboard/implementation/new/page.tsx",
      "app/dashboard/implementation/projects/page.tsx",
      "app/dashboard/implementation/checklist/page.tsx",
      "app/dashboard/implementation/activity/page.tsx",
      "app/dashboard/implementation/go-live/page.tsx",
      "app/dashboard/implementation/migration/page.tsx",
      "app/dashboard/implementation/integrations/page.tsx",
      "app/dashboard/implementation/training/page.tsx",
      "app/dashboard/implementation/uat/page.tsx",
      "app/dashboard/implementation/risks/page.tsx",
      "app/dashboard/implementation/handoff/page.tsx",
      "app/dashboard/implementation/reports/page.tsx",
      "app/dashboard/implementation/enterprise/page.tsx",
      "app/dashboard/implementation/[projectId]/page.tsx",
      "app/dashboard/implementation/[projectId]/checklist/page.tsx",
      "app/dashboard/implementation/[projectId]/timeline/page.tsx",
      "app/dashboard/implementation/[projectId]/training/page.tsx",
      "app/dashboard/implementation/[projectId]/migration/page.tsx",
      "app/dashboard/implementation/[projectId]/go-live/page.tsx",
      "app/dashboard/implementation/[projectId]/integrations/page.tsx",
      "app/dashboard/implementation/[projectId]/uat/page.tsx",
      "app/dashboard/implementation/[projectId]/activity/page.tsx",
      "app/dashboard/implementation/[projectId]/risks/page.tsx",
      "app/dashboard/staff/page.tsx",
      "app/dashboard/staff/roster/page.tsx",
      "app/dashboard/staff/[staffId]/page.tsx",
      "app/dashboard/staff/roles/page.tsx",
      "app/dashboard/staff/time-clock/page.tsx",
      "app/dashboard/staff/shifts/page.tsx",
      "app/dashboard/staff/schedule/page.tsx",
      "app/dashboard/staff/certifications/page.tsx",
      "app/dashboard/staff/availability/page.tsx",
      "app/dashboard/staff/drivers/page.tsx",
      "app/dashboard/staff/reports/page.tsx",
    ];

    for (const rel of files) {
      expect(read(rel)).not.toContain("dataUserId");
    }
  });

  it("keeps staff brand lookups aligned to workspaceId instead of owner userId", () => {
    const files = [
      "app/dashboard/staff/page.tsx",
      "app/dashboard/staff/roster/page.tsx",
      "app/dashboard/staff/[staffId]/page.tsx",
    ];

    for (const rel of files) {
      const content = read(rel);
      expect(content).toContain("workspaceId");
      expect(content).not.toContain("workspaceId: userId");
      expect(content).not.toContain("workspaceId: dataUserId");
    }
  });

  it("keeps routes bundle owner-scoped without deriving workspace brand context from the session user id", () => {
    const overview = read("app/dashboard/routes/page.tsx");
    const planner = read("app/dashboard/routes/planner/page.tsx");

    expect(overview).toContain("findOwnerKitchenSettings(userId");
    expect(overview).not.toContain("where: { id: user.id }");

    expect(planner).toContain("findOwnerKitchenSettings(userId");
    expect(planner).toContain("workspaceId");
    expect(planner).not.toContain("ownerUserId: user.id");
  });

  it("keeps sales-channels bundle aligned to owner userId for metrics, plan gates, and activity", () => {
    const overview = read("app/dashboard/sales-channels/page.tsx");
    const webhooks = read("app/dashboard/sales-channels/webhooks/page.tsx");
    const detail = read("app/dashboard/sales-channels/connections/[connectionId]/page.tsx");

    expect(overview).toContain("prisma.kitchenSettings.findUnique({ where: { userId } })");
    expect(overview).toContain("loadSalesChannelMetrics(userId)");

    expect(webhooks).toContain('<PlanGate userId={userId} feature="webhook_replay"');
    expect(webhooks).not.toContain("PlanGate userId={dataUserId}");

    expect(detail).toContain("integrationConnectionByIdWhereForOwner(userId, connectionId)");
    expect(detail).toContain("listActivityForEntity(userId, conn.id, 25)");
  });

  it("keeps observability and recovery surfaces aligned to owner userId", () => {
    const systemHealth = read("app/dashboard/system-health/page.tsx");
    const incidents = read("app/dashboard/system-health/incidents/page.tsx");
    const integrity = read("app/dashboard/system-health/data-integrity/page.tsx");
    const recovery = read("app/dashboard/error-recovery/page.tsx");
    const auditDetail = read("app/dashboard/operations/audits/[auditId]/page.tsx");

    expect(systemHealth).toContain("loadOperationHealth(userId)");
    expect(systemHealth).toContain("loadWorkspaceObservabilityPanel(userId)");
    expect(systemHealth).toContain("loadProductionIncidentRollup(userId)");

    expect(incidents).toContain("loadProductionIncidentRollup(userId)");
    expect(incidents).not.toContain("loadProductionIncidentRollup(dataUserId)");

    expect(integrity).toContain("listIntegrityIssues(userId, 80)");
    expect(integrity).toContain("evaluateInventoryShortageReadiness(userId)");

    expect(recovery).toContain("webhookEventListWhereForOwner(userId)");
    expect(recovery).toContain("integrationConnectionListWhereForOwner(userId)");
    expect(recovery).toContain("loadProductionIncidentRollup(userId)");

    expect(auditDetail).toContain("getOperationsAudit(auditId, userId)");
    expect(auditDetail).not.toContain("getOperationsAudit(auditId, dataUserId)");
  });

  it("keeps locations bundle aligned to owner userId and scoped brand filters", () => {
    const overview = read("app/dashboard/locations/page.tsx");
    const assignment = read("app/dashboard/locations/assignment/page.tsx");
    const profile = read("app/dashboard/locations/[locationId]/profile/page.tsx");
    const brands = read("app/dashboard/locations/[locationId]/brands/page.tsx");
    const detail = read("app/dashboard/locations/[locationId]/page.tsx");
    const service = read("services/locations/location-service.ts");

    expect(overview).toContain("listLocationsForUser({ userId })");
    expect(overview).toContain("loadLocationOverviewKpis(userId)");
    expect(overview).toContain('<PlanGate userId={userId} feature="multi_location"');

    expect(detail).toContain("getLocationForUser({ userId }, locationId)");
    expect(detail).toContain("orderListWhereForOwnerAnd(userId, {");

    expect(assignment).toContain("brandListWhereForOwner(userId)");
    expect(assignment).not.toContain("workspace: { ownerUserId:");

    expect(profile).toContain("brandListWhereForOwner(userId)");
    expect(brands).toContain("brandListWhereForOwner(userId)");
    expect(brands).not.toContain("workspace: { ownerUserId:");

    expect(service).toContain("brandListWhereForOwner(userId)");
  });

  it("keeps meal-plans bundle aligned to owner userId and avoids workspace-id alias mismatches", () => {
    const overview = read("app/dashboard/meal-plans/page.tsx");
    const create = read("app/dashboard/meal-plans/new/page.tsx");
    const detail = read("app/dashboard/meal-plans/[planId]/page.tsx");
    const reports = read("app/dashboard/meal-plans/reports/page.tsx");

    expect(overview).toContain("listMealPlansForUser({ userId }, { take: 25 })");
    expect(overview).toContain("loadMealPlanOverviewKpis(userId)");
    expect(overview).toContain("backfillLegacySubscriptions(userId)");
    expect(overview).toContain('<PlanGate userId={userId} feature="customer_crm"');

    expect(create).toContain("brandListWhereForOwner(userId)");
    expect(create).not.toContain("workspaceId: dataUserId");
    expect(create).not.toContain("workspaceId: userId");

    expect(detail).toContain("getMealPlanForUser({ userId }, planId)");
    expect(detail).toContain("productListWhereForOwnerAnd(userId, { active: true })");

    expect(reports).toContain("loadMealPlanOverviewKpis(userId)");
  });

  it("keeps tasks bundle aligned to owner userId while preserving session-specific my-task logic", () => {
    const overview = read("app/dashboard/tasks/page.tsx");
    const create = read("app/dashboard/tasks/new/page.tsx");
    const detail = read("app/dashboard/tasks/[taskId]/page.tsx");
    const settings = read("app/dashboard/tasks/settings/page.tsx");
    const templates = read("app/dashboard/tasks/templates/page.tsx");
    const my = read("app/dashboard/tasks/my/page.tsx");

    expect(overview).toContain("loadTaskOverviewKpis(userId, now)");
    expect(overview).toContain("where: { id: userId }");
    expect(overview).not.toContain("where: { id: user.id }");

    expect(create).toContain("brandListWhereForOwner(userId)");
    expect(create).toContain("where: { id: userId }");
    expect(create).not.toContain("workspace: { ownerUserId: user.id }");

    expect(detail).toContain("getTaskForUser({ userId }, taskId)");

    expect(settings).toContain("where: { id: userId }");
    expect(templates).toContain("where: { id: userId }");

    expect(my).toContain("where: { userId, email: user.email ?? undefined }");
    expect(my).toContain("orFilters.push({ createdById: user.id })");
  });

  it("keeps customers bundle aligned to owner userId and owner-scoped CRM terminology", () => {
    const overview = read("app/dashboard/customers/page.tsx");
    const list = read("app/dashboard/customers/list/page.tsx");
    const reports = read("app/dashboard/customers/reports/page.tsx");
    const detail = read("app/dashboard/customers/[customerId]/page.tsx");
    const followUps = read("app/dashboard/customers/follow-ups/page.tsx");
    const dedupe = read("app/dashboard/customers/dedupe/page.tsx");
    const deduplication = read("app/dashboard/customers/deduplication/page.tsx");
    const segments = read("app/dashboard/customers/segments/page.tsx");
    const companies = read("app/dashboard/customers/companies/page.tsx");
    const loyalty = read("app/dashboard/customers/loyalty/page.tsx");
    const churnRisk = read("app/dashboard/customers/churn-risk/page.tsx");
    const feedback = read("app/dashboard/customers/feedback/page.tsx");

    expect(overview).toContain("where: { id: userId }");
    expect(overview).toContain("kitchenCustomerListWhereForOwner(userId)");
    expect(overview).toContain("orderListWhereForOwner(userId)");
    expect(overview).toContain("backfillCustomersFromOrders(userId)");
    expect(overview).toContain("listCustomersForUser({ userId }, { take: 25 })");
    expect(overview).toContain("loadCrmOverviewKpis(userId)");
    expect(overview).toContain('<PlanGate userId={userId} feature="customer_crm"');
    expect(overview).not.toContain("where: { id: user.id }");

    expect(list).toContain("{ userId },");
    expect(reports).toContain("loadCrmOverviewKpis(userId)");
    expect(reports).toContain("where: { userId, createdAt: { gte: since } }");
    expect(reports).toContain("where: { userId }");

    expect(detail).toContain("getCustomerForUser({ userId }, customerId)");
    expect(detail).toContain("listOrdersForCustomer({ userId }, customer.email, 50)");
    expect(detail).toContain("where: { userId, customerId: customer.id }");

    expect(followUps).toContain("where: { userId, status: { in: [\"OPEN\", \"OVERDUE\"] } }");
    expect(dedupe).toContain("findDuplicateGroups({ userId }, 1000)");
    expect(deduplication).toContain("findMany({ where: { userId }, orderBy: { createdAt: \"desc\" }, take: 500 })");
    expect(segments).toContain("where: { userId }");
    expect(companies).toContain("where: { userId }");
    expect(loyalty).toContain("getOrCreateLoyaltyProgram(userId)");
    expect(loyalty).toContain("listLoyaltyAccounts(userId)");
    expect(loyalty).toContain("getLoyaltyTransactions(userId, 50)");
    expect(churnRisk).toContain("listChurnRiskCustomers(userId)");
    expect(feedback).toContain("listCustomerFeedback(userId)");
  });

  it("keeps copilot bundle aligned to owner userId without owner-bypassing actor scopes", () => {
    const overview = read("app/dashboard/copilot/page.tsx");
    const insights = read("app/dashboard/copilot/insights/page.tsx");
    const audit = read("app/dashboard/copilot/audit/page.tsx");
    const settings = read("app/dashboard/copilot/settings/page.tsx");
    const summaries = read("app/dashboard/copilot/summaries/page.tsx");
    const drafts = read("app/dashboard/copilot/drafts/page.tsx");
    const sources = read("app/dashboard/copilot/sources/page.tsx");
    const chat = read("app/dashboard/copilot/chat/page.tsx");
    const actions = read("actions/copilot.ts");

    expect(overview).toContain("const actor = await requireWorkspacePermissionActor()");
    expect(overview).toContain("const scope = createCopilotActorScope(actor)");
    expect(overview).toContain("buildDeterministicSnapshot(userId)");
    expect(overview).toContain("where: { id: userId }");

    expect(insights).toContain("const scope = createCopilotActorScope(actor)");
    expect(audit).toContain("const scope = createCopilotActorScope(actor)");
    expect(settings).toContain("const scope = createCopilotActorScope(actor)");
    expect(summaries).toContain("buildDeterministicSnapshot(userId)");
    expect(summaries).toContain("where: { id: userId }");
    expect(drafts).toContain("const scope = createCopilotActorScope(actor)");
    expect(sources).toContain("const scope = createCopilotActorScope(actor)");
    expect(chat).toContain("const scope = createCopilotActorScope(actor)");

    expect(actions).toContain("const actor = await requireWorkspacePermissionActor()");
    expect(actions).toContain("return createCopilotActorScope(actor)");
    expect(actions).not.toContain("requireTenantActor");
    expect(actions).not.toContain("isOwner: true");
  });

  it("keeps reports bundle aligned to owner userId and actor-aware report permissions", () => {
    const overview = read("app/dashboard/reports/page.tsx");
    const library = read("app/dashboard/reports/library/page.tsx");
    const generator = read("app/dashboard/reports/[reportKey]/page.tsx");
    const financial = read("app/dashboard/reports/financial/page.tsx");
    const executive = read("app/dashboard/reports/executive/page.tsx");
    const operations = read("app/dashboard/reports/operations/page.tsx");
    const saved = read("app/dashboard/reports/saved/page.tsx");
    const history = read("app/dashboard/reports/history/page.tsx");
    const settings = read("app/dashboard/reports/settings/page.tsx");
    const enterprise = read("app/dashboard/reports/enterprise/page.tsx");
    const menuEngineering = read("app/dashboard/reports/menu-engineering/page.tsx");
    const pnl = read("app/dashboard/reports/financial/pnl/page.tsx");
    const actions = read("actions/reports.ts");
    const exportRoute = read("app/api/export/report/route.ts");
    const pnlExportRoute = read("app/api/export/restaurant-pnl/route.ts");

    expect(overview).toContain("const actor = await requireWorkspacePermissionActor()");
    expect(overview).toContain("const scope = createReportActorScope(actor)");
    expect(overview).toContain("where: { id: userId }");
    expect(overview).toContain("listReportExportHistory(userId, 5)");
    expect(overview).toContain("listSavedReports(userId)");

    expect(library).toContain("const scope = createReportActorScope(actor)");
    expect(library).toContain("where: { id: userId }");
    expect(generator).toContain("const scope = createReportActorScope(actor)");
    expect(generator).toContain("runReport(reportKey, { userId, scope, filters })");
    expect(generator).toContain("where: { workspace: { ownerUserId: userId } }");
    expect(generator).toContain("where: { userId }");

    expect(financial).toContain('canDoReports(scope, "reports.read.financial")');
    expect(executive).toContain('canDoReports(scope, "reports.read.financial")');
    expect(operations).toContain("const scope = createReportActorScope(actor)");
    expect(saved).toContain('canDoReports(scope, "reports.saved.manage")');
    expect(saved).toContain("listSavedReports(userId)");
    expect(history).toContain("canExportReports(actor)");
    expect(history).toContain("listReportExportHistory(userId, 100)");
    expect(settings).toContain("where: { id: userId }");
    expect(enterprise).toContain('canDoReports(scope, "reports.read.financial")');
    expect(enterprise).toContain("prisma.order.count({ where: { userId } })");
    expect(enterprise).toContain("prisma.brand.count({ where: { workspace: { ownerUserId: userId } } })");
    expect(menuEngineering).toContain('canDoReports(scope, "reports.read.financial")');
    expect(menuEngineering).toContain("getMenuEngineeringMatrix(userId)");
    expect(pnl).toContain('canDoReports(scope, "reports.read.financial")');
    expect(pnl).toContain("refreshPnlSnapshot(userId, period)");
    expect(pnl).toContain("getRestaurantPnLStatement(userId, period)");

    expect(actions).toContain("const actor = await requireWorkspacePermissionActor()");
    expect(actions).toContain("return createReportActorScope(actor)");
    expect(actions).toContain("runReport(args.reportKey, {");
    expect(actions).toContain("userId,");
    expect(actions).not.toContain("requireTenantActor");
    expect(actions).not.toContain("isOwner: true");

    expect(exportRoute).toContain("requireReportExportActor");
    expect(exportRoute).toContain("createReportActorScope(actor)");
    expect(exportRoute).toContain("actor.dataUserId");
    expect(exportRoute).toContain("const result = await runReport(key, { userId, scope, filters })");
    expect(exportRoute).not.toContain("createClient");
    expect(exportRoute).not.toContain("isOwner: true");

    expect(pnlExportRoute).toContain('canDoReports(scope, "reports.read.financial")');
    expect(pnlExportRoute).toContain("getRestaurantPnLStatement(userId, p)");
    expect(pnlExportRoute).not.toContain("requireTenantActor");
  });

  it("keeps implementation bundle aligned to owner userId and actor-aware implementation permissions", () => {
    const layout = read("app/dashboard/implementation/layout.tsx");
    const overview = read("app/dashboard/implementation/page.tsx");
    const newPage = read("app/dashboard/implementation/new/page.tsx");
    const projects = read("app/dashboard/implementation/projects/page.tsx");
    const handoff = read("app/dashboard/implementation/handoff/page.tsx");
    const reports = read("app/dashboard/implementation/reports/page.tsx");
    const enterprise = read("app/dashboard/implementation/enterprise/page.tsx");
    const projectDetail = read("app/dashboard/implementation/[projectId]/page.tsx");
    const projectGoLive = read("app/dashboard/implementation/[projectId]/go-live/page.tsx");
    const projectIntegrations = read("app/dashboard/implementation/[projectId]/integrations/page.tsx");
    const projectMigration = read("app/dashboard/implementation/[projectId]/migration/page.tsx");
    const projectActivity = read("app/dashboard/implementation/[projectId]/activity/page.tsx");
    const projectRisks = read("app/dashboard/implementation/[projectId]/risks/page.tsx");
    const actions = read("actions/implementation-center.ts");

    expect(layout).toContain("const actor = await requireWorkspacePermissionActor()");
    expect(layout).toContain("const scope = createImplementationActorScope(actor)");
    expect(layout).toContain('canUseImplementation(scope, "implementation.view")');

    expect(overview).toContain("const scope = createImplementationActorScope(actor)");
    expect(overview).toContain("getActiveProject(userId)");
    expect(overview).toContain("projectKpis(userId)");
    expect(overview).toContain("getLatestReadiness({ userId, projectId: active.id })");
    expect(overview).toContain("where: { userId, pinned: true }");
    expect(overview).toContain("where: { userId, status: \"CONNECTED\" }");
    expect(overview).toContain("<ProjectListPreview userId={userId} />");

    expect(newPage).toContain('canUseImplementation(scope, "implementation.create")');
    expect(newPage).toContain("where: { id: actor.userId }");
    expect(projects).toContain("where: { userId }");

    expect(handoff).toContain("const { userId: ownerId } = await requireTenantActor()");
    expect(handoff).toContain("prisma.staffMember.count({ where: { userId: ownerId, active: true } })");
    expect(handoff).toContain("project: { userId: ownerId }");

    expect(reports).toContain('canUseImplementation(scope, "implementation.reports")');
    expect(reports).toContain("productMappingListWhereForOwner(userId)");
    expect(reports).toContain("importJobListWhereForOwner(userId)");
    expect(reports).toContain("where: { userId }");
    expect(reports).toContain("project: { userId }");

    expect(enterprise).toContain("where: { userId }");
    expect(projectDetail).toContain("getProject(userId, projectId)");
    expect(projectDetail).toContain("getLatestReadiness({ userId, projectId })");
    expect(projectGoLive).toContain("getProject(userId, projectId)");
    expect(projectGoLive).toContain("getLatestReadiness({ userId, projectId })");
    expect(projectIntegrations).toContain("getProject(userId, projectId)");
    expect(projectIntegrations).toContain("where: { userId }");
    expect(projectMigration).toContain("getProject(userId, projectId)");
    expect(projectMigration).toContain("where: { userId }");
    expect(projectActivity).toContain("getProject(userId, projectId)");
    expect(projectActivity).toContain("listEvents(projectId, userId, 200)");
    expect(projectRisks).toContain("getProject(userId, projectId)");
    expect(projectRisks).toContain("listRisks(projectId, userId)");

    expect(actions).toContain("const actor = await requireWorkspacePermissionActor()");
    expect(actions).toContain("return createImplementationActorScope(actor)");
    expect(actions).toContain("userId: scope.userId");
    expect(actions).toContain("createdById: scope.sessionUserId");
    expect(actions).not.toContain("requireUserProfile");
    expect(actions).not.toContain("isOwner: true");
    expect(actions).not.toContain('role: "admin"');
  });
});
