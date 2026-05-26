import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS_STEPS: { key: string; label: string }[] = [
  { key: "SUBMITTED", label: "Received" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "IN_PRODUCTION", label: "In production" },
  { key: "READY", label: "Ready" },
  { key: "COMPLETED", label: "Completed" },
];

function stepIndex(status: string): number {
  const i = STATUS_STEPS.findIndex((s) => s.key === status);
  return i >= 0 ? i : 0;
}

export default async function StorefrontOrderTrackPage({
  params,
}: {
  params: Promise<{ storeSlug: string; orderId: string }>;
}) {
  const { storeSlug, orderId } = await params;

  const order = await prisma.storefrontOrder.findFirst({
    where: {
      storefront: { storeSlug },
      ...(UUID_RE.test(orderId)
        ? { OR: [{ id: orderId }, { publicToken: orderId }] }
        : { publicToken: orderId }),
    },
    select: {
      id: true,
      publicToken: true,
      orderNumber: true,
      status: true,
      createdAt: true,
      total: true,
      customerName: true,
      storefront: { select: { currency: true, publicName: true } },
    },
  });

  if (!order) notFound();

  const current = stepIndex(order.status);
  const currency = order.storefront?.currency ?? "USD";

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {order.storefront?.publicName ?? "Your order"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {order.orderNumber ? `#${order.orderNumber}` : `Token ${order.publicToken.slice(0, 8)}…`}
        </p>
      </div>

      <ol className="mt-10 space-y-4">
        {STATUS_STEPS.map((step, i) => {
          const done = i <= current;
          return (
            <li
              key={step.key}
              className={`flex items-center gap-3 text-sm ${done ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-muted dark:bg-gray-800"
                }`}
              >
                {i < current ? "✓" : i + 1}
              </span>
              <span className="font-medium">{step.label}</span>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 rounded-xl border border-border/80 bg-muted/40 p-6 text-center dark:border-gray-800 dark:bg-gray-900/60">
        <p className="text-sm text-muted-foreground">Order for</p>
        <p className="text-lg font-semibold">{order.customerName}</p>
        <p className="mt-2 text-2xl font-bold tabular-nums">{formatCurrency(Number(order.total), currency)}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Placed {order.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        </p>
        <Button asChild variant="link" className="mt-4">
          <Link href={`/s/${storeSlug}/order/${order.publicToken}`}>Full order details</Link>
        </Button>
      </div>
    </div>
  );
}
