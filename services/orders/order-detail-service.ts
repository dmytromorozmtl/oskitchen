import { profileQuery } from "@/lib/observability/prisma-query-profile";
import { prisma } from "@/lib/prisma";
import { channelConflictWhereForOwner } from "@/lib/scope/channel-import-scope";
import { whereOwnedOrderForOwner } from "@/lib/scope/owned-order-guard";
import { foodOpsPhaseFromOrder } from "@/lib/workflows/workflow-status";
import type { OrderLikeForLifecycle } from "@/lib/workflows/order-lifecycle-rules";
import {
  describeOrderNextBestAction,
  listAllowedOrderStatusTransitions,
} from "@/services/workflows/order-lifecycle-service";
import { activeWorkflowBranches } from "@/services/workflows/workflow-service";
import { listActivityForEntity } from "@/services/activity/activity-service";
import { blockersFromPreloaded } from "@/services/orders/order-blocker-service";
import { buildOrderLifecycleView } from "@/services/orders/order-lifecycle-service";
import { resolveOrderNextActionBundle } from "@/services/orders/order-next-action-service";
import { buildFoodopsWorkflowView } from "@/services/workflows/foodops-workflow-service";
import { loadStorefrontCommerceForInternalOrder } from "@/services/orders/storefront-order-commerce-service";
import { decryptOrderPiiFields } from "@/lib/orders/order-pii";

const orderDetailInclude = {
  orderItems: {
    include: { product: { select: { id: true, title: true, barcode: true, recipe: { select: { id: true } } } } },
  },
  kitchenCustomer: { select: { id: true, name: true, displayName: true, email: true } },
  importedFromExternal: { select: { id: true, syncStatus: true, provider: true } },
  channelImportBatch: { select: { id: true, status: true } },
  productionWorkItems: {
    take: 40,
    select: {
      id: true,
      status: true,
      orderItemId: true,
      productId: true,
      product: { select: { title: true, recipe: { select: { id: true } } } },
    },
  },
  packingTasks: { take: 20, select: { id: true, status: true } },
  deliveryStops: { take: 20, select: { id: true, sequence: true, status: true } },
  posTransactions: {
    take: 1,
    select: { id: true, receiptNumber: true, receipt: { select: { id: true, receiptNumber: true } } },
  },
} as const;

export type OrderDetailLoaded = NonNullable<Awaited<ReturnType<typeof loadOrderDetailPageData>>>["order"];

export function formatOrderPageTitle(order: OrderDetailLoaded): string {
  const pos = order.posTransactions[0];
  if (pos?.receiptNumber) return pos.receiptNumber;
  const d = order.createdAt.toISOString().slice(0, 10);
  return `Order · ${d}`;
}

export function summarizeDeliveryAddress(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim() || "";
  if (typeof value !== "object" || Array.isArray(value)) return "";
  const o = value as Record<string, unknown>;
  const parts = [o.line1, o.line2, o.city, o.region, o.postalCode, o.country]
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);
  return parts.join(", ");
}

export async function loadOrderDetailPageData(userId: string, orderId: string) {
  const orderWhere = await whereOwnedOrderForOwner(userId, orderId);
  const order = await profileQuery("orders.detail.page", () =>
    prisma.order.findFirst({
      where: orderWhere,
      include: orderDetailInclude,
    }),
  );
  if (!order) return null;

  const orderWithPii = {
    ...order,
    ...decryptOrderPiiFields({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
    }),
  };

  const [activity, mappingConflicts, storefrontCommerce] = await Promise.all([
    listActivityForEntity(userId, order.id, 40),
    prisma.channelConflict.count({
      where: {
        AND: [
          await channelConflictWhereForOwner(userId),
          {
            status: "OPEN",
            conflictType: "missing_product_mapping",
            record: { importedEntityId: orderId, recordType: "ORDER" },
          },
        ],
      },
    }),
    order.creationSource === "STOREFRONT"
      ? loadStorefrontCommerceForInternalOrder(userId, order.id)
      : Promise.resolve(null),
  ]);

  const blockers = blockersFromPreloaded(order.id, order, mappingConflicts);
  const lifecycleView = buildOrderLifecycleView(order, blockers);

  const lifecycleSnap: OrderLikeForLifecycle = {
    id: order.id,
    status: order.status,
    fulfillmentType: order.fulfillmentType,
    fulfillmentDetail: order.fulfillmentDetail,
    orderType: order.orderType,
    creationSource: order.creationSource,
    sourceMetadataJson: order.sourceMetadataJson,
    pickupDate: order.pickupDate,
    deliveryAddressJson: order.deliveryAddressJson,
    paymentStatus: order.paymentStatus,
    orderItemsCount: order.orderItems.length,
  };
  const allowedTransitions = listAllowedOrderStatusTransitions(lifecycleSnap);
  const nextBest = describeOrderNextBestAction(lifecycleSnap);
  const nextActions = resolveOrderNextActionBundle({
    orderId: order.id,
    order: lifecycleSnap,
    blockers: lifecycleView.blockers,
    customerLinked: order.customerId != null,
  });
  const foodopsWorkflow = buildFoodopsWorkflowView({
    order: {
      id: order.id,
      status: order.status,
      statusDetail: order.statusDetail,
      fulfillmentType: order.fulfillmentType,
      fulfillmentDetail: order.fulfillmentDetail,
      orderType: order.orderType,
      creationSource: order.creationSource,
      sourceMetadataJson: order.sourceMetadataJson,
      pickupDate: order.pickupDate,
      deliveryAddressJson: order.deliveryAddressJson,
      paymentStatus: order.paymentStatus,
      paymentMode: order.paymentMode,
      customerId: order.customerId,
      customerName: orderWithPii.customerName,
      customerEmail: orderWithPii.customerEmail,
      customerPhone: orderWithPii.customerPhone,
      orderItems: order.orderItems,
      productionWorkItems: order.productionWorkItems,
      packingTasks: order.packingTasks,
      deliveryStops: order.deliveryStops,
      posTransactions: order.posTransactions,
      importedFromExternal: order.importedFromExternal,
      channelImportBatch: order.channelImportBatch,
    },
    blockers: lifecycleView.blockers,
    nextActions,
    allowedTransitions,
  });
  const deliverySummary = summarizeDeliveryAddress(order.deliveryAddressJson);
  const branches = activeWorkflowBranches(order);
  const phase = foodOpsPhaseFromOrder(order);

  return {
    order: orderWithPii,
    activity,
    branches,
    phase,
    lifecycleSnap,
    allowedTransitions,
    nextBest,
    nextActions,
    deliverySummary,
    lifecycleView,
    foodopsWorkflow,
    storefrontCommerce,
  };
}
