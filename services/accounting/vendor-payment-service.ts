import { prisma } from "@/lib/prisma";
import { purchaseOrderByIdWhereForOwner } from "@/lib/scope/workspace-accounting-scope";
import { purchaseOrderListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export function isMelioConfigured(): boolean {
  return Boolean(process.env.MELIO_API_KEY?.trim());
}

export async function payApprovedPurchaseOrder(
  userId: string,
  purchaseOrderId: string,
): Promise<{ ok: true; paymentId?: string } | { ok: false; error: string }> {
  const key = process.env.MELIO_API_KEY?.trim();
  if (!key) return { ok: false, error: "MELIO_API_KEY not configured" };

  const poWhere = await purchaseOrderByIdWhereForOwner(userId, purchaseOrderId);
  const po = await prisma.purchaseOrder.findFirst({
    where: { AND: [poWhere, { status: "APPROVED" }] },
    include: { supplier: true },
  });
  if (!po) return { ok: false, error: "Approved PO not found" };

  const amount = Number(po.total);
  const res = await fetch("https://api.melio.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount_cents: Math.round(amount * 100),
      vendor_name: po.supplier.name,
      reference: po.id,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) return { ok: false, error: json.message ?? `Melio ${res.status}` };

  await prisma.purchaseOrder.update({
    where: { id: po.id },
    data: { status: "SENT", notes: `${po.notes ?? ""}\nPaid via Melio ${json.id ?? ""}`.trim() },
  });

  return { ok: true, paymentId: json.id };
}

export async function listVendorPaymentsQueue(userId: string) {
  const scope = await purchaseOrderListWhereForOwner(userId);
  return prisma.purchaseOrder.findMany({
    where: { AND: [scope, { status: "APPROVED" }] },
    include: { supplier: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
    take: 50,
  });
}
