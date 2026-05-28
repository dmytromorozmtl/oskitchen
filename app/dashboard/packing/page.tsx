import { PackingCommandCenter } from "@/components/dashboard/packing-command-center";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import {
  hasPackingManagePageAccess,
  loadWorkspacePermissionPageActor,
  resolvePackingDeniedSurfaceId,
} from "@/lib/ux/permission-denied-page-access-era19";
import { findOwnerKitchenSettings } from "@/lib/scope/owner-kitchen-settings";
import { getCachedOrderListWhere } from "@/lib/scope/cached-workspace-order-scope";
import { formatYyyyMmDdForInput, packingDayFromYyyyMmDd } from "@/lib/packing/packing-dates";
import { computePackingKpis } from "@/lib/packing/packing-kpis";
import { defaultPackingModeForBusiness } from "@/lib/packing/packing-modes";
import { prisma } from "@/lib/prisma";
import {
  loadPackingTasksForDate,
  loadPackingWavesForDate,
  parsePackingCommandMode,
} from "@/services/packing/load-packing-page-data";

export default async function PackingPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string; mode?: string; fulfillment?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const actor = await loadWorkspacePermissionPageActor();

  if (!hasPackingManagePageAccess(actor)) {
    return (
      <PermissionDeniedSurfaceCard surfaceId={resolvePackingDeniedSurfaceId("command")} />
    );
  }

  const { dataUserId } = actor;

  const kitchen = await findOwnerKitchenSettings(dataUserId, { businessType: true });
  const businessType = kitchen?.businessType ?? null;

  const packingDay = packingDayFromYyyyMmDd(sp.date);
  const packingDateStr = formatYyyyMmDdForInput(packingDay);
  const defaultMode = defaultPackingModeForBusiness(businessType);
  const mode = parsePackingCommandMode(sp.mode, defaultMode);
  const fulfillment =
    sp.fulfillment === "PICKUP" || sp.fulfillment === "DELIVERY" ? sp.fulfillment : "ALL";

  const fulfillmentWhere =
    fulfillment === "ALL" ? {} : { fulfillmentType: fulfillment as "PICKUP" | "DELIVERY" };
  const orderWhere = await getCachedOrderListWhere();

  const [orders, tasks, waves, labelTemplateCount] = await Promise.all([
    prisma.order.findMany({
      where: {
        AND: [
          orderWhere,
          {
            status: { in: ["CONFIRMED", "PREPARING", "READY"] },
            ...fulfillmentWhere,
          },
        ],
      },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { pickupDate: "asc" },
    }),
    loadPackingTasksForDate(dataUserId, packingDay),
    loadPackingWavesForDate(dataUserId, packingDay),
    prisma.labelTemplate.count({ where: { userId: dataUserId, active: true } }),
  ]);

  const dto = orders.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    fulfillmentType: o.fulfillmentType,
    pickupDate: o.pickupDate ? o.pickupDate.toISOString() : null,
    items: o.orderItems.map((i) => ({
      orderItemId: i.id,
      quantity: i.quantity,
      title: i.product?.title ?? i.title ?? "Custom item",
      preparedDate: i.product?.preparedDate ? i.product.preparedDate.toISOString() : i.preparedDate ? i.preparedDate.toISOString() : null,
      pickupDate: i.product?.pickupDate ? i.product.pickupDate.toISOString() : null,
      allergens: i.product?.allergens ?? null,
    })),
  }));

  const kpiRows = tasks.map((t) => ({
    id: t.id,
    orderId: t.orderId,
    quantity: t.quantity,
    fulfillmentType: t.fulfillmentType,
    status: t.status,
    requiresLabel: t.requiresLabel,
    requiresNutritionLabel: t.requiresNutritionLabel,
    requiresAllergenCheck: t.requiresAllergenCheck,
    labelPrintedAt: t.labelPrintedAt,
    packedAt: t.packedAt,
    verifiedAt: t.verifiedAt,
  }));

  const kpis = computePackingKpis(kpiRows, dto);

  return (
    <PackingCommandCenter
      businessType={businessType}
      packingDateStr={packingDateStr}
      mode={mode}
      fulfillment={fulfillment}
      orders={dto}
      tasks={tasks}
      waves={waves}
      kpis={kpis}
      labelTemplateCount={labelTemplateCount}
    />
  );
}
