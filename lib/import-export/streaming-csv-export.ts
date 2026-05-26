import { prisma } from "@/lib/prisma";
import { toCsvRow } from "@/lib/import-export/csv-format";
import type { ExportType } from "@/lib/import-export/export-types";
import { productListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";

const BATCH = 500;

export type StreamExportMeta = {
  filename: string;
  headers: string[];
};

export function streamExportMeta(kind: ExportType): StreamExportMeta | null {
  switch (kind) {
    case "orders":
      return {
        filename: "kitchenos-orders.csv",
        headers: [
          "id",
          "customerName",
          "customerEmail",
          "status",
          "fulfillmentType",
          "total",
          "pickupDate",
          "createdAt",
        ],
      };
    case "customers":
      return {
        filename: "kitchenos-customers.csv",
        headers: ["email", "name", "orders", "lifetimeValue"],
      };
    case "products":
      return {
        filename: "kitchenos-products.csv",
        headers: ["id", "title", "price", "menuId", "active", "createdAt"],
      };
    case "production":
      return {
        filename: "kitchenos-production.csv",
        headers: ["productId", "title", "menuTitle", "preparedDate", "cooked", "packed", "labeled", "assignedTo"],
      };
    case "inventory":
      return {
        filename: "kitchenos-ingredients.csv",
        headers: ["id", "name", "unit", "supplier", "costPerUnit", "currentStock", "parLevel"],
      };
    default:
      return null;
  }
}

/** Returns a ReadableStream for large tenant exports (orders, customers). */
export function createStreamingCsvExport(userId: string, kind: ExportType): ReadableStream<Uint8Array> | null {
  const meta = streamExportMeta(kind);
  if (!meta) return null;

  const encoder = new TextEncoder();

  if (kind === "orders") {
    return new ReadableStream({
      async start(controller) {
        const orderWhere = await orderListWhereForOwner(userId);
        controller.enqueue(encoder.encode(toCsvRow(meta.headers)));
        let cursor: string | undefined;
        for (;;) {
          const batch = await prisma.order.findMany({
            where: orderWhere,
            orderBy: { createdAt: "desc" },
            take: BATCH,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            select: {
              id: true,
              customerName: true,
              customerEmail: true,
              status: true,
              fulfillmentType: true,
              total: true,
              pickupDate: true,
              createdAt: true,
            },
          });
          if (batch.length === 0) break;
          for (const o of batch) {
            controller.enqueue(
              encoder.encode(
                toCsvRow([
                  o.id,
                  o.customerName,
                  o.customerEmail,
                  o.status,
                  o.fulfillmentType,
                  o.total.toString(),
                  o.pickupDate?.toISOString() ?? "",
                  o.createdAt.toISOString(),
                ]),
              ),
            );
          }
          if (batch.length < BATCH) break;
          cursor = batch[batch.length - 1]!.id;
        }
        controller.close();
      },
    });
  }

  if (kind === "customers") {
    return new ReadableStream({
      async start(controller) {
        const orderWhere = await orderListWhereForOwner(userId);
        controller.enqueue(encoder.encode(toCsvRow(meta.headers)));
        const map = new Map<string, { name: string; orders: number; lifetime: number }>();
        let cursor: string | undefined;
        for (;;) {
          const batch = await prisma.order.findMany({
            where: orderWhere,
            orderBy: { id: "asc" },
            take: BATCH,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            select: { id: true, customerEmail: true, customerName: true, total: true },
          });
          if (batch.length === 0) break;
          for (const o of batch) {
            const key = o.customerEmail.toLowerCase();
            const spend = Number(o.total);
            const prev = map.get(key);
            if (!prev) map.set(key, { name: o.customerName, orders: 1, lifetime: spend });
            else {
              map.set(key, {
                name: o.customerName,
                orders: prev.orders + 1,
                lifetime: prev.lifetime + spend,
              });
            }
          }
          if (batch.length < BATCH) break;
          cursor = batch[batch.length - 1]!.id;
        }
        for (const [email, v] of map) {
          controller.enqueue(
            encoder.encode(toCsvRow([email, v.name, v.orders, v.lifetime.toFixed(2)])),
          );
        }
        controller.close();
      },
    });
  }

  if (kind === "products") {
    return new ReadableStream({
      async start(controller) {
        const productWhere = await productListWhereForOwner(userId);
        controller.enqueue(encoder.encode(toCsvRow(meta.headers)));
        let cursor: string | undefined;
        for (;;) {
          const batch = await prisma.product.findMany({
            where: productWhere,
            orderBy: { createdAt: "desc" },
            take: BATCH,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            select: {
              id: true,
              title: true,
              price: true,
              menuId: true,
              active: true,
              createdAt: true,
            },
          });
          if (batch.length === 0) break;
          for (const p of batch) {
            controller.enqueue(
              encoder.encode(
                toCsvRow([
                  p.id,
                  p.title,
                  p.price.toString(),
                  p.menuId,
                  p.active ? "true" : "false",
                  p.createdAt.toISOString(),
                ]),
              ),
            );
          }
          if (batch.length < BATCH) break;
          cursor = batch[batch.length - 1]!.id;
        }
        controller.close();
      },
    });
  }

  if (kind === "production") {
    return new ReadableStream({
      async start(controller) {
        const productWhere = await productListWhereForOwner(userId);
        controller.enqueue(encoder.encode(toCsvRow(meta.headers)));
        let cursor: string | undefined;
        for (;;) {
          const batch = await prisma.product.findMany({
            where: productWhere,
            orderBy: [{ menuId: "asc" }, { sortOrder: "asc" }],
            take: BATCH,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            include: { menu: { select: { title: true } }, productionTask: true },
          });
          if (batch.length === 0) break;
          for (const p of batch) {
            controller.enqueue(
              encoder.encode(
                toCsvRow([
                  p.id,
                  p.title,
                  p.menu.title,
                  p.preparedDate.toISOString(),
                  p.productionTask?.cooked ? "yes" : "no",
                  p.productionTask?.packed ? "yes" : "no",
                  p.productionTask?.labeled ? "yes" : "no",
                  p.productionTask?.assignedTo ?? "",
                ]),
              ),
            );
          }
          if (batch.length < BATCH) break;
          cursor = batch[batch.length - 1]!.id;
        }
        controller.close();
      },
    });
  }

  if (kind === "inventory") {
    return new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(toCsvRow(meta.headers)));
        let cursor: string | undefined;
        for (;;) {
          const batch = await prisma.ingredient.findMany({
            where: { userId },
            orderBy: { name: "asc" },
            take: BATCH,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
          });
          if (batch.length === 0) break;
          for (const i of batch) {
            controller.enqueue(
              encoder.encode(
                toCsvRow([
                  i.id,
                  i.name,
                  i.unit,
                  i.supplier ?? "",
                  i.costPerUnit.toString(),
                  i.currentStock.toString(),
                  i.parLevel.toString(),
                ]),
              ),
            );
          }
          if (batch.length < BATCH) break;
          cursor = batch[batch.length - 1]!.id;
        }
        controller.close();
      },
    });
  }

  return null;
}
