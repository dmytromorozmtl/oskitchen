import Link from "next/link";

import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "items", label: "Items" },
  { id: "production", label: "Production" },
  { id: "packing", label: "Packing" },
  { id: "fulfillment", label: "Fulfillment" },
  { id: "customer", label: "Customer" },
  { id: "notes", label: "Notes" },
  { id: "activity", label: "Activity" },
  { id: "audit", label: "Audit" },
] as const;

export type OrderDetailTabId = (typeof TABS)[number]["id"];

export function OrderDetailTabNav({
  orderId,
  tab,
  counts,
}: {
  orderId: string;
  tab: string;
  counts?: Partial<Record<"items" | "production" | "packing" | "activity", number>>;
}) {
  const active = TABS.some((t) => t.id === tab) ? tab : "overview";
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-border/70 bg-muted/30 p-1">
      {TABS.map((t) => {
        const c =
          t.id === "items"
            ? counts?.items
            : t.id === "production"
              ? counts?.production
              : t.id === "packing"
                ? counts?.packing
                : t.id === "activity"
                  ? counts?.activity
                  : undefined;
        const suffix = typeof c === "number" ? ` (${c})` : "";
        return (
          <Link
            key={t.id}
            href={`/dashboard/orders/${orderId}?tab=${t.id}`}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {suffix}
          </Link>
        );
      })}
    </div>
  );
}
