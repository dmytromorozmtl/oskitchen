import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { prisma } from "@/lib/prisma";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { orderCreateInputSchema, type OrderCreateInput } from "@/lib/orders/order-validation";
import { ownerScopedAnd } from "@/lib/scope/workspace-resource-scope";
import { auditLog } from "@/services/audit/audit-service";
import { createOrderViaCenter } from "@/services/orders/order-creation-service";
import { enqueueKitchenRoutingForPosOrder } from "@/services/pos/pos-kitchen-routing-service";
import * as tabService from "@/services/pos/tab-service";

export type HandheldKdsFireLine = {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

export type HandheldKdsFireInput = {
  registerId: string;
  shiftId: string | null;
  staffMemberId: string | null;
  locationId: string | null;
  tableId: string | null;
  tableName: string | null;
  tabId: string | null;
  lines: HandheldKdsFireLine[];
};

export type HandheldKdsFireResult =
  | {
      ok: true;
      orderId: string;
      workItemsCreated: number;
      tabId: string | null;
      lineCount: number;
    }
  | { ok: false; error: string };

export async function fireHandheldOrderToKds(
  userId: string,
  performedByUserId: string,
  input: HandheldKdsFireInput,
): Promise<HandheldKdsFireResult> {
  const gate = await canUseFeature(userId, "pos_terminal");
  if (!gate.allowed) {
    return {
      ok: false,
      error: gate.reason ? `POS unavailable (${gate.reason}).` : "POS is not enabled for this plan.",
    };
  }

  if (!input.lines.length) {
    return { ok: false, error: "Add items before firing to KDS." };
  }

  const register = await prisma.pOSRegister.findFirst({
    where: { id: input.registerId, userId },
    select: { id: true, locationId: true },
  });
  if (!register) {
    return { ok: false, error: "Register not found." };
  }

  const notes = input.tableName
    ? `Handheld — Table ${input.tableName}`
    : "Handheld order — KDS fire";

  const orderInput: OrderCreateInput = orderCreateInputSchema.parse({
    orderType: "POS_SALE",
    statusKey: "CONFIRMED",
    fulfillmentDetail: "DINE_IN",
    paymentMode: "REQUEST_ONLY",
    locationId: input.locationId ?? register.locationId ?? undefined,
    notes,
    sourceMetadataJson: JSON.stringify({
      pos: {
        registerId: register.id,
        shiftId: input.shiftId,
        staffMemberId: input.staffMemberId,
        fulfillmentIntent: "DINE_IN",
        handheld: true,
        tableId: input.tableId,
        tableName: input.tableName,
      },
    }),
    lines: input.lines.map((line) => ({
      productId: line.productId,
      title: line.title,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    })),
  });

  const created = await createOrderViaCenter(
    { userId, performedById: performedByUserId },
    orderInput,
  );
  if (!created.ok) {
    return { ok: false, error: created.error };
  }

  await enqueueKitchenRoutingForPosOrder(userId, created.orderId);

  const workItemScope = await ownerScopedAnd(userId, { orderId: created.orderId });
  const workItemsCreated = await prisma.productionWorkItem.count({ where: workItemScope });

  const tabId = input.tabId;
  if (tabId) {
    for (const line of input.lines) {
      await tabService.addItemToTab(tabId, userId, {
        productName: line.title,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      });
    }
  }

  await auditLog({
    actor: { userId: performedByUserId },
    action: AUDIT_ACTIONS.HANDHELD_KDS_FIRED,
    category: "ORDERS",
    source: "USER",
    severity: "INFO",
    entity: { type: "Order", id: created.orderId, label: "HANDHELD_KDS" },
    metadata: {
      registerId: register.id,
      tableId: input.tableId,
      tableName: input.tableName,
      tabId,
      workItemsCreated,
      lineCount: input.lines.length,
    },
    maskPiiInMetadata: true,
  });

  return {
    ok: true,
    orderId: created.orderId,
    workItemsCreated,
    tabId,
    lineCount: input.lines.length,
  };
}
