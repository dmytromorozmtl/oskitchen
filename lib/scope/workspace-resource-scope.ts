import type { IntegrationProvider, Prisma } from "@prisma/client";

import { rewriteOrderEmailFilters } from "@/lib/orders/order-pii";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

/** Shared tenant filter shape across Order, Menu, Product, IntegrationConnection, WebhookEvent. */
export type OwnerScopedWhereInput = {
  userId?: string;
  workspaceId?: string | null;
  OR?: Array<{ workspaceId?: string | null; userId?: string }>;
};

/**
 * Canonical owner-scoped Prisma filters after workspace_id NOT NULL migration.
 * Prefer `workspaceId` when the owner has a workspace; otherwise fall back to `userId`.
 *
 * Default includes legacy rows (`workspaceId: null`) for the same owner until backfill completes.
 * Set `WORKSPACE_SCOPE_STRICT=1` for workspace-only filtering post-backfill.
 */
export function buildOwnerScopedWhere(
  ownerUserId: string,
  workspaceId: string | null,
): OwnerScopedWhereInput {
  if (workspaceId) {
    if (process.env.WORKSPACE_SCOPE_STRICT === "1") {
      return { workspaceId };
    }
    return {
      OR: [{ workspaceId }, { userId: ownerUserId, workspaceId: null }],
    };
  }
  return { userId: ownerUserId };
}

export async function resolveOwnerScopedWhere(
  ownerUserId: string,
): Promise<OwnerScopedWhereInput> {
  const workspaceId = await resolveOwnerWorkspaceId(ownerUserId);
  return buildOwnerScopedWhere(ownerUserId, workspaceId);
}

function andId(scope: OwnerScopedWhereInput, id: string) {
  return { AND: [scope, { id }] };
}

// ——— Orders (re-exported via workspace-order-scope for compatibility) ———

export async function orderListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.OrderWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.OrderWhereInput;
}

export async function orderByIdWhereForOwner(
  ownerUserId: string,
  orderId: string,
): Promise<Prisma.OrderWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, orderId) as Prisma.OrderWhereInput;
}

export async function orderListWhereForOwnerAnd(
  ownerUserId: string,
  extra: Prisma.OrderWhereInput,
): Promise<Prisma.OrderWhereInput> {
  const base = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [base, rewriteOrderEmailFilters(extra)] } as Prisma.OrderWhereInput;
}

// ——— Menus ———

export async function menuListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.MenuWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.MenuWhereInput;
}

export async function menuByIdWhereForOwner(
  ownerUserId: string,
  menuId: string,
): Promise<Prisma.MenuWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, menuId) as Prisma.MenuWhereInput;
}

export async function menuListWhereForOwnerAnd(
  ownerUserId: string,
  extra: Prisma.MenuWhereInput,
): Promise<Prisma.MenuWhereInput> {
  const base = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [base, extra] } as Prisma.MenuWhereInput;
}

// ——— Products (no userId column; scope via workspaceId or owning menu) ———

export function buildProductOwnerScopedWhere(
  ownerUserId: string,
  workspaceId: string | null,
): Prisma.ProductWhereInput {
  if (workspaceId) {
    if (process.env.WORKSPACE_SCOPE_LEGACY_OR === "1") {
      return {
        OR: [{ workspaceId }, { workspaceId: null, menu: { userId: ownerUserId } }],
      };
    }
    return { workspaceId };
  }
  return { menu: { userId: ownerUserId } };
}

export async function resolveProductOwnerScopedWhere(
  ownerUserId: string,
): Promise<Prisma.ProductWhereInput> {
  const workspaceId = await resolveOwnerWorkspaceId(ownerUserId);
  return buildProductOwnerScopedWhere(ownerUserId, workspaceId);
}

export async function productListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ProductWhereInput> {
  return resolveProductOwnerScopedWhere(ownerUserId);
}

export async function productByIdWhereForOwner(
  ownerUserId: string,
  productId: string,
): Promise<Prisma.ProductWhereInput> {
  const scope = await resolveProductOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: productId }] };
}

export async function productListWhereForOwnerAnd(
  ownerUserId: string,
  extra: Prisma.ProductWhereInput,
): Promise<Prisma.ProductWhereInput> {
  const base = await resolveProductOwnerScopedWhere(ownerUserId);
  return { AND: [base, extra] };
}

export async function productByIdWhereForOwnerWithMenuFallback(
  ownerUserId: string,
  productId: string,
): Promise<Prisma.ProductWhereInput> {
  const scope = await resolveProductOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { id: productId }] };
}

// ——— Integration connections (Phase 2) ———

export async function integrationConnectionListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.IntegrationConnectionWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.IntegrationConnectionWhereInput;
}

export async function integrationConnectionByIdWhereForOwner(
  ownerUserId: string,
  connectionId: string,
): Promise<Prisma.IntegrationConnectionWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, connectionId) as Prisma.IntegrationConnectionWhereInput;
}

export async function integrationConnectionByProviderWhereForOwner(
  ownerUserId: string,
  provider: IntegrationProvider,
): Promise<Prisma.IntegrationConnectionWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [scope, { provider }] } as Prisma.IntegrationConnectionWhereInput;
}

// ——— Webhook events (Phase 2) ———

export async function webhookEventListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.WebhookEventWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.WebhookEventWhereInput;
}

// ——— Phase 12 pilot models (workspaceId column) ———

export async function cateringQuoteListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.CateringQuoteWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.CateringQuoteWhereInput;
}

export async function cateringQuoteByIdWhereForOwner(
  ownerUserId: string,
  quoteId: string,
): Promise<Prisma.CateringQuoteWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, quoteId) as Prisma.CateringQuoteWhereInput;
}

export async function apiKeyListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ApiKeyWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ApiKeyWhereInput;
}

export async function automationRuleListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.AutomationRuleWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.AutomationRuleWhereInput;
}

export async function analyticsEventListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.AnalyticsEventWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.AnalyticsEventWhereInput;
}

export async function analyticsSnapshotListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.AnalyticsSnapshotWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.AnalyticsSnapshotWhereInput;
}

export async function analyticsAlertListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.AnalyticsAlertWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.AnalyticsAlertWhereInput;
}

export async function billingEventListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.BillingEventWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.BillingEventWhereInput;
}

export async function analyticsSavedViewListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.AnalyticsSavedViewWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.AnalyticsSavedViewWhereInput;
}

export async function cateringQuoteTemplateListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.CateringQuoteTemplateWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.CateringQuoteTemplateWhereInput;
}

export async function channelFeeRuleListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ChannelFeeRuleWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ChannelFeeRuleWhereInput;
}

export async function forecastRunListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ForecastRunWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ForecastRunWhereInput;
}

export async function forecastRunByIdWhereForOwner(
  ownerUserId: string,
  runId: string,
): Promise<Prisma.ForecastRunWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, runId) as Prisma.ForecastRunWhereInput;
}

export async function giftCardListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.GiftCardWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.GiftCardWhereInput;
}

export async function customerSegmentListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.CustomerSegmentWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.CustomerSegmentWhereInput;
}

export async function customerSubscriptionListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.CustomerSubscriptionWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.CustomerSubscriptionWhereInput;
}

export async function deliveryRouteListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.DeliveryRouteWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.DeliveryRouteWhereInput;
}

export async function inventoryStockListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.InventoryStockWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.InventoryStockWhereInput;
}

export async function costingRunListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.CostingRunWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.CostingRunWhereInput;
}

export async function deliveryZoneListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.DeliveryZoneWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.DeliveryZoneWhereInput;
}

export async function executiveSnapshotListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ExecutiveSnapshotWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ExecutiveSnapshotWhereInput;
}

export async function entitlementOverrideListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.EntitlementOverrideWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.EntitlementOverrideWhereInput;
}

/** Audit logs may use nullable userId; scope by owner + workspace OR legacy rows. */
export async function auditLogListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.AuditLogWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.AuditLogWhereInput;
}

export async function foodSafetyChecklistListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.FoodSafetyChecklistWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.FoodSafetyChecklistWhereInput;
}

export async function foodSafetyAuditListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.FoodSafetyAuditWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.FoodSafetyAuditWhereInput;
}

export async function franchiseListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.FranchiseWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.FranchiseWhereInput;
}

export async function goLiveProjectListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.GoLiveProjectWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.GoLiveProjectWhereInput;
}

export async function goLiveProjectByIdWhereForOwner(
  ownerUserId: string,
  projectId: string,
): Promise<Prisma.GoLiveProjectWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, projectId) as Prisma.GoLiveProjectWhereInput;
}

export async function implementationProjectListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ImplementationProjectWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ImplementationProjectWhereInput;
}

export async function implementationProjectByIdWhereForOwner(
  ownerUserId: string,
  projectId: string,
): Promise<Prisma.ImplementationProjectWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, projectId) as Prisma.ImplementationProjectWhereInput;
}

export async function holidayPackageListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.HolidayPackageWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.HolidayPackageWhereInput;
}

export async function grubhubDeliveryListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.GrubhubDeliveryWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.GrubhubDeliveryWhereInput;
}

export async function importMappingTemplateListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ImportMappingTemplateWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ImportMappingTemplateWhereInput;
}

export async function ingredientDeclarationListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.IngredientDeclarationWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.IngredientDeclarationWhereInput;
}

export async function ingredientDemandRunListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.IngredientDemandRunWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.IngredientDemandRunWhereInput;
}

export async function ingredientDemandRunByIdWhereForOwner(
  ownerUserId: string,
  runId: string,
): Promise<Prisma.IngredientDemandRunWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, runId) as Prisma.IngredientDemandRunWhereInput;
}

export async function ingredientDemandLineListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.IngredientDemandLineWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.IngredientDemandLineWhereInput;
}

export async function ingredientSubstitutionListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.IngredientSubstitutionWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.IngredientSubstitutionWhereInput;
}

export async function ingredientListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.IngredientWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.IngredientWhereInput;
}

export async function inventoryCountListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.InventoryCountWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.InventoryCountWhereInput;
}

export async function inventoryCountByIdWhereForOwner(
  ownerUserId: string,
  countId: string,
): Promise<Prisma.InventoryCountWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, countId) as Prisma.InventoryCountWhereInput;
}

export async function invoiceRecordListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.InvoiceRecordWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.InvoiceRecordWhereInput;
}

export async function kitchenModulePreferenceListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.KitchenModulePreferenceWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.KitchenModulePreferenceWhereInput;
}

export async function kitchenTaskListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.KitchenTaskWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.KitchenTaskWhereInput;
}

export async function kitchenTaskByIdWhereForOwner(
  ownerUserId: string,
  taskId: string,
): Promise<Prisma.KitchenTaskWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, taskId) as Prisma.KitchenTaskWhereInput;
}

export async function kitchenTaskTemplateListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.KitchenTaskTemplateWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.KitchenTaskTemplateWhereInput;
}

export async function labelTemplateListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.LabelTemplateWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.LabelTemplateWhereInput;
}

export async function labelVerificationEventListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.LabelVerificationEventWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.LabelVerificationEventWhereInput;
}

export async function laborRateListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.LaborRateWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.LaborRateWhereInput;
}

export async function lifecycleEmailListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.LifecycleEmailWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.LifecycleEmailWhereInput;
}

export async function lifecycleEventListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.LifecycleEventWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.LifecycleEventWhereInput;
}

export async function locationListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.LocationWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.LocationWhereInput;
}

export async function locationByIdWhereForOwner(
  ownerUserId: string,
  locationId: string,
): Promise<Prisma.LocationWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, locationId) as Prisma.LocationWhereInput;
}

export async function locationAssignmentEventListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.LocationAssignmentEventWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.LocationAssignmentEventWhereInput;
}

export async function loyaltyAccountListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.LoyaltyAccountWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.LoyaltyAccountWhereInput;
}

export async function loyaltyProgramListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.LoyaltyProgramWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.LoyaltyProgramWhereInput;
}

export async function marginRuleListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.MarginRuleWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.MarginRuleWhereInput;
}

export async function mealPlanListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.MealPlanWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.MealPlanWhereInput;
}

export async function mealPlanByIdWhereForOwner(
  ownerUserId: string,
  planId: string,
): Promise<Prisma.MealPlanWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, planId) as Prisma.MealPlanWhereInput;
}

export async function mealPlanTemplateListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.MealPlanTemplateWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.MealPlanTemplateWhereInput;
}

export async function menuChannelPublishListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.MenuChannelPublishWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.MenuChannelPublishWhereInput;
}

export async function menuRotationRuleListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.MenuRotationRuleWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.MenuRotationRuleWhereInput;
}

export async function menuTemplateListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.MenuTemplateWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.MenuTemplateWhereInput;
}

export async function notificationEventListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.NotificationEventWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.NotificationEventWhereInput;
}

export async function notificationPreferenceListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.NotificationPreferenceWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.NotificationPreferenceWhereInput;
}

export async function notificationTemplateListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.NotificationTemplateWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.NotificationTemplateWhereInput;
}

export async function nutritionProfileListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.NutritionProfileWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.NutritionProfileWhereInput;
}

export async function operationsChecklistListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.OperationsChecklistWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.OperationsChecklistWhereInput;
}

export async function operationsChecklistByIdWhereForOwner(
  ownerUserId: string,
  checklistId: string,
): Promise<Prisma.OperationsChecklistWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, checklistId) as Prisma.OperationsChecklistWhereInput;
}

export async function operationsAuditListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.OperationsAuditWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.OperationsAuditWhereInput;
}

export async function operationsAuditByIdWhereForOwner(
  ownerUserId: string,
  auditId: string,
): Promise<Prisma.OperationsAuditWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, auditId) as Prisma.OperationsAuditWhereInput;
}

export async function orderChannelListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.OrderChannelWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.OrderChannelWhereInput;
}

export async function packagingItemListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.PackagingItemWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.PackagingItemWhereInput;
}

export async function packingBatchListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.PackingBatchWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.PackingBatchWhereInput;
}

export async function packingBatchByIdWhereForOwner(
  ownerUserId: string,
  batchId: string,
): Promise<Prisma.PackingBatchWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, batchId) as Prisma.PackingBatchWhereInput;
}

export async function packingScanEventListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.PackingScanEventWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.PackingScanEventWhereInput;
}

export async function packingTaskListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.PackingTaskWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.PackingTaskWhereInput;
}

export async function packingVerificationSessionListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.PackingVerificationSessionWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.PackingVerificationSessionWhereInput;
}

export async function purchaseOrderListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.PurchaseOrderWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.PurchaseOrderWhereInput;
}

export async function recipeListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.RecipeWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.RecipeWhereInput;
}

export async function reorderQueueItemListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ReorderQueueItemWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ReorderQueueItemWhereInput;
}

export async function costSnapshotListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.CostSnapshotWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.CostSnapshotWhereInput;
}

export async function storefrontDomainListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.StorefrontDomainWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.StorefrontDomainWhereInput;
}

export async function usageEventListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.UsageEventWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.UsageEventWhereInput;
}

export async function executiveInsightListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ExecutiveInsightWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ExecutiveInsightWhereInput;
}

/** Merge owner tenant scope with extra Prisma filters (hot-path services). */
export async function ownerScopedAnd<T extends Record<string, unknown>>(
  ownerUserId: string,
  extra: T,
): Promise<{ AND: [OwnerScopedWhereInput, T] }> {
  const base = await resolveOwnerScopedWhere(ownerUserId);
  return { AND: [base, extra] };
}

export async function posTabListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.PosTabWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.PosTabWhereInput;
}

export async function posTabByIdWhereForOwner(
  ownerUserId: string,
  tabId: string,
): Promise<Prisma.PosTabWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, tabId) as Prisma.PosTabWhereInput;
}

export async function productionPlanTaskListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ProductionPlanTaskWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ProductionPlanTaskWhereInput;
}

export async function productionPlanTaskByIdWhereForOwner(
  ownerUserId: string,
  taskId: string,
): Promise<Prisma.ProductionPlanTaskWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, taskId) as Prisma.ProductionPlanTaskWhereInput;
}

export async function productionBatchListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ProductionBatchWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ProductionBatchWhereInput;
}

export async function staffMemberListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.StaffMemberWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.StaffMemberWhereInput;
}

export async function staffMemberByIdWhereForOwner(
  ownerUserId: string,
  staffMemberId: string,
): Promise<Prisma.StaffMemberWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, staffMemberId) as Prisma.StaffMemberWhereInput;
}

export async function pickupWindowListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.PickupWindowWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.PickupWindowWhereInput;
}

export async function pickupWindowByIdWhereForOwner(
  ownerUserId: string,
  windowId: string,
): Promise<Prisma.PickupWindowWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, windowId) as Prisma.PickupWindowWhereInput;
}

export async function storefrontSettingsListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.StorefrontSettingsWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.StorefrontSettingsWhereInput;
}

export async function posRegisterListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.POSRegisterWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.POSRegisterWhereInput;
}

export async function posRegisterByIdWhereForOwner(
  ownerUserId: string,
  registerId: string,
): Promise<Prisma.POSRegisterWhereInput> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  return andId(scope, registerId) as Prisma.POSRegisterWhereInput;
}

export async function posShiftListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.POSShiftWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.POSShiftWhereInput;
}

export async function posHeldOrderListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.POSHeldOrderWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.POSHeldOrderWhereInput;
}

export async function posTransactionListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.POSTransactionWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.POSTransactionWhereInput;
}

export async function supportTicketListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.SupportTicketWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.SupportTicketWhereInput;
}

export async function productionWorkItemListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ProductionWorkItemWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ProductionWorkItemWhereInput;
}

export async function staffRoleListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.StaffRoleWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.StaffRoleWhereInput;
}

export async function staffEventListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.StaffEventWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.StaffEventWhereInput;
}

export async function staffShiftListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.StaffShiftWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.StaffShiftWhereInput;
}

export async function staffShiftByIdWhereForOwner(
  ownerUserId: string,
  shiftId: string,
): Promise<Prisma.StaffShiftWhereInput> {
  const scope = await staffShiftListWhereForOwner(ownerUserId);
  return { AND: [scope, { id: shiftId }] } as Prisma.StaffShiftWhereInput;
}

export async function supplierListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.SupplierWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.SupplierWhereInput;
}

export async function staffCertificationListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.StaffCertificationWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.StaffCertificationWhereInput;
}

export async function notificationRuleListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.NotificationRuleWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.NotificationRuleWhereInput;
}

export async function notificationLogListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.NotificationLogWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.NotificationLogWhereInput;
}

export async function storefrontOrderListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.StorefrontOrderWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.StorefrontOrderWhereInput;
}

export async function commissaryTransferListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.CommissaryTransferWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.CommissaryTransferWhereInput;
}

export async function commissaryTransferByIdWhereForOwner(
  ownerUserId: string,
  transferId: string,
): Promise<Prisma.CommissaryTransferWhereInput> {
  const scope = await commissaryTransferListWhereForOwner(ownerUserId);
  return { AND: [scope, { id: transferId }] } as Prisma.CommissaryTransferWhereInput;
}

export async function copilotInsightListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.CopilotInsightWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.CopilotInsightWhereInput;
}

export async function copilotConversationListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.CopilotConversationWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.CopilotConversationWhereInput;
}

export async function copilotActionDraftListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.CopilotActionDraftWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.CopilotActionDraftWhereInput;
}

export async function workspaceProductCategoryListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.WorkspaceProductCategoryWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.WorkspaceProductCategoryWhereInput;
}

export async function referralCodeListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.ReferralCodeWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.ReferralCodeWhereInput;
}

export async function iotSensorDeviceListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.IotSensorDeviceWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.IotSensorDeviceWhereInput;
}

export async function deliveryDispatchListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.DeliveryDispatchWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.DeliveryDispatchWhereInput;
}

export async function restaurantTableListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.RestaurantTableWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.RestaurantTableWhereInput;
}

export async function storefrontAssetListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.StorefrontAssetWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.StorefrontAssetWhereInput;
}

export async function organizationMemberListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.OrganizationMemberWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.OrganizationMemberWhereInput;
}

export async function deliveryProofListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.DeliveryProofWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.DeliveryProofWhereInput;
}

export async function customerFeedbackListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.CustomerFeedbackWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.CustomerFeedbackWhereInput;
}

export async function temperatureLogListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.TemperatureLogWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.TemperatureLogWhereInput;
}

export async function brandListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.BrandWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.BrandWhereInput;
}

export async function customerHealthSnapshotListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.CustomerHealthSnapshotWhereInput> {
  return resolveOwnerScopedWhere(ownerUserId) as Prisma.CustomerHealthSnapshotWhereInput;
}
