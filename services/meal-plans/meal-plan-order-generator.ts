import {
  CustomerTimelineEventType,
  MealPlanCycleStatus,
  MealPlanEventType,
  Prisma,
} from "@prisma/client";

import {
  buildMealPlanGenerationPreview,
  buildOrderNotesFromPreview,
  type MealPlanGenerationPreview,
} from "@/lib/meal-plans/meal-plan-generation";
import { nextCycleStart } from "@/lib/meal-plans/meal-plan-schedules";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { recomputeMetricsForOrderEmail } from "@/services/crm/customer-metrics-service";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";

type Scope = { userId: string };

/**
 * Read-only preview. No DB writes other than a timeline event so the operator
 * can see in audit who previewed when. Use the result to render the confirm
 * page.
 */
export async function previewCycleGeneration(scope: Scope, cycleId: string, performedBy?: string | null): Promise<MealPlanGenerationPreview | null> {
  const cycle = await prisma.mealPlanCycle.findFirst({
    where: { id: cycleId, mealPlan: { userId: scope.userId } },
    include: {
      mealPlan: { include: { customer: { select: { email: true, name: true, displayName: true } } } },
      selections: true,
    },
  });
  if (!cycle) return null;

  const productIds = cycle.selections.map((s) => s.productId).filter((p): p is string => !!p);
  const products =
    productIds.length === 0
      ? []
      : await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, title: true, price: true, allergens: true, active: true },
        });

  await prisma.mealPlanEvent.create({
    data: {
      mealPlanId: cycle.mealPlanId,
      cycleId: cycle.id,
      eventType: MealPlanEventType.ORDER_PREVIEWED,
      performedBy: performedBy ?? null,
    },
  });

  return buildMealPlanGenerationPreview({
    plan: cycle.mealPlan,
    cycle,
    selections: cycle.selections,
    products,
    customer: {
      email: cycle.mealPlan.customer.email,
      name: cycle.mealPlan.customer.displayName ?? cycle.mealPlan.customer.name,
    },
  });
}

export type GenerateDraftOrderResult =
  | { ok: true; orderId: string; cycleId: string }
  | { ok: false; error: string };

/**
 * Strict draft generator:
 *  - Reuses preview to compute lines.
 *  - Refuses if cycle is already GENERATED or has an orderId.
 *  - Always creates the Order with status PENDING (= draft). Never CONFIRMED.
 *  - Inserts OrderItems only when a productId is present.
 *  - Sets MealPlanCycle.status = GENERATED, orderId, generatedAt.
 *  - Appends MealPlanEvent ORDER_DRAFT_GENERATED.
 *  - Bumps plan.nextOrderDate to the next anchor.
 *  - Appends CRM timeline + recomputes customer metrics (post-create).
 */
export async function generateDraftOrderForCycle(scope: Scope, cycleId: string, performedBy?: string | null): Promise<GenerateDraftOrderResult> {
  const preview = await previewCycleGeneration(scope, cycleId, performedBy);
  if (!preview) return { ok: false, error: "Cycle not found." };
  if (!preview.ok) {
    return { ok: false, error: preview.blockingErrors.join(" ") };
  }

  const cycle = await prisma.mealPlanCycle.findFirst({
    where: { id: cycleId, mealPlan: { userId: scope.userId } },
    include: {
      mealPlan: {
        include: {
          customer: { select: { id: true, email: true, name: true, displayName: true, phone: true } },
        },
      },
    },
  });
  if (!cycle) return { ok: false, error: "Cycle not found." };
  if (cycle.orderId || cycle.status === MealPlanCycleStatus.GENERATED) {
    return { ok: false, error: "Cycle already has a generated order." };
  }

  const plan = cycle.mealPlan;
  const customer = plan.customer;

  const orderLines = preview.lines.filter(
    (
      l,
    ): l is (typeof l) & { productId: string; unitPrice: number; total: number } =>
      Boolean(l.productId) && l.unitPrice != null && l.total != null,
  );

  if (orderLines.length === 0) {
    return { ok: false, error: "No selections with linked products — link a product first." };
  }

  const total = preview.subtotal;
  const notes = buildOrderNotesFromPreview(preview, plan);

  const result = await prisma.$transaction(async (tx) => {
    const order = await persistResolvedOrder(
      {
        userId: scope.userId,
        db: tx,
      },
      {
        orderType: "MEAL_PLAN_ORDER",
        creationSource: "MEAL_PLAN",
        statusKey: "DRAFT",
        paymentMode: "PAY_LATER",
        brandId: plan.brandId,
        locationId: plan.locationId,
        customerId: customer.id,
        customerName: customer.displayName ?? customer.name ?? customer.email,
        customerEmail: customer.email,
        customerPhone: customer.phone ?? undefined,
        fulfillmentDetail: plan.fulfillmentMode === "DELIVERY" ? "DELIVERY" : "PICKUP",
        fulfillmentDate: cycle.cycleStartDate,
        notes,
        subtotal: total,
        total,
        lines: orderLines.map((l) => ({
            productId: l.productId,
            title: l.title,
            sku: undefined,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            lineTotal: l.total,
            notes: l.notes ?? undefined,
            preparedDate: null,
            modifiersJson: null,
            sourceMappingId: null,
          })),
      },
    );
    await tx.mealPlanCycle.update({
      where: { id: cycle.id },
      data: {
        status: MealPlanCycleStatus.GENERATED,
        orderId: order.orderId,
        generatedAt: new Date(),
      },
    });
    await tx.mealPlanEvent.create({
      data: {
        mealPlanId: plan.id,
        cycleId: cycle.id,
        eventType: MealPlanEventType.ORDER_DRAFT_GENERATED,
        performedBy: performedBy ?? null,
        metadataJson: { orderId: order.orderId, total } as Prisma.InputJsonValue,
      },
    });
    await tx.mealPlan.update({
      where: { id: plan.id },
      data: { nextOrderDate: nextCycleStart(cycle.cycleStartDate, plan.frequency) },
    });
    return order;
  });

  try {
    await prisma.customerTimelineEvent.create({
      data: {
        customerId: customer.id,
        eventType: CustomerTimelineEventType.OTHER,
        sourceType: "meal_plan_order",
        sourceId: result.orderId,
        summary: `Draft order generated from meal plan "${plan.name}"`,
        metadataJson: { mealPlanId: plan.id, cycleId: cycle.id } as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logger.warn("[meal-plans] CRM timeline write failed", error);
  }
  await recomputeMetricsForOrderEmail(scope.userId, customer.email);

  return { ok: true, orderId: result.orderId, cycleId: cycle.id };
}
