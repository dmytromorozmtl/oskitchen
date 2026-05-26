import Link from "next/link";

import { HolidayPackageForm } from "@/components/dashboard/marketing/holiday-package-form";
import { PageShell } from "@/components/layout/page-shell";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

function maxOrdersFromJson(raw: unknown): number | null {
  if (!raw || typeof raw !== "object") return null;
  const m = (raw as { maxOrders?: number }).maxOrders;
  return typeof m === "number" ? m : null;
}

export default async function HolidayPackagesPage() {
  const { dataUserId } = await getTenantActor();
  const packages = await prisma.holidayPackage.findMany({
    where: { userId: dataUserId },
    orderBy: { availableFrom: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Holiday packages</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Seasonal bundles with fixed pricing and date windows for storefront preorders.
        </p>
        <Link
          href="/dashboard/marketing/email-campaigns"
          className="mt-2 inline-block text-sm text-primary hover:underline"
        >
          ← Marketing
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <HolidayPackageForm />
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Your packages</h2>
          <ul className="space-y-3">
            {packages.map((p) => {
              const maxOrders = maxOrdersFromJson(p.productIdsJson);
              return (
                <li key={p.id} className="rounded-xl border border-border/80 p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{p.title}</span>
                    <span className="tabular-nums">{formatCurrency(Number(p.price), p.currency)}</span>
                  </div>
                  {p.description ? (
                    <p className="mt-2 text-muted-foreground">{p.description}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.availableFrom.toISOString().slice(0, 10)} →{" "}
                    {p.availableUntil.toISOString().slice(0, 10)} · {p._count.orders} orders
                    {maxOrders != null ? ` / ${maxOrders} max` : ""} · {p.active ? "Active" : "Inactive"}
                  </p>
                </li>
              );
            })}
            {!packages.length ? (
              <p className="text-sm text-muted-foreground">
                No packages yet — create one with the form.
              </p>
            ) : null}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
