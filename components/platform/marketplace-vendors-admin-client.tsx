"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  bulkModeratePlatformVendorsAction,
  moderatePlatformVendorAction,
} from "@/actions/platform/marketplace-vendors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  vendorStatusBadgeVariant,
  vendorStatusLabel,
  VENDOR_TYPE_OPTIONS,
} from "@/lib/marketplace/vendor-registration-types";
import {
  platformVendorAdminFiltersToQuery,
  type PlatformVendorAdminFilters,
} from "@/lib/platform/marketplace-vendor-admin-filters";
import type { PlatformVendorListItem } from "@/services/marketplace/platform-vendor-moderation-service";

const STATUS_OPTIONS = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
  "DEACTIVATED",
] as const;

const PLAN_OPTIONS = [
  { value: "FREE", label: "Free" },
  { value: "GROWTH", label: "Growth" },
  { value: "ENTERPRISE", label: "Enterprise" },
] as const;

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function MarketplaceVendorsAdminClient({
  filters,
  result,
  canModerate,
}: {
  filters: PlatformVendorAdminFilters;
  result: {
    items: PlatformVendorListItem[];
    total: number;
    page: number;
    totalPages: number;
  };
  canModerate: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>([]);

  function navigate(next: Partial<PlatformVendorAdminFilters>) {
    const merged = { ...filters, ...next };
    const query = platformVendorAdminFiltersToQuery(merged);
    const qs = new URLSearchParams(query).toString();
    router.push(qs ? `/platform/marketplace/vendors?${qs}` : "/platform/marketplace/vendors");
  }

  function toggleVendor(vendorId: string, checked: boolean) {
    setSelected((prev) =>
      checked ? [...new Set([...prev, vendorId])] : prev.filter((id) => id !== vendorId),
    );
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? result.items.map((item) => item.id) : []);
  }

  function runModeration(vendorId: string, action: "approve" | "reject" | "suspend" | "reactivate") {
    startTransition(async () => {
      const response = await moderatePlatformVendorAction({ vendorId, action });
      if (response.ok) {
        toast.success(`Vendor ${action}d.`);
        setSelected((prev) => prev.filter((id) => id !== vendorId));
      } else {
        toast.error(response.error);
      }
    });
  }

  function runBulk(action: "approve" | "suspend") {
    if (selected.length === 0) return;
    startTransition(async () => {
      const response = await bulkModeratePlatformVendorsAction({ vendorIds: selected, action });
      if (response.ok) {
        toast.success(`${response.updated} vendor(s) updated.`);
        setSelected([]);
      } else {
        toast.error(response.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters.tab === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => navigate({ tab: "all", page: 1 })}
        >
          All vendors
        </Button>
        <Button
          variant={filters.tab === "queue" ? "default" : "outline"}
          size="sm"
          onClick={() => navigate({ tab: "queue", page: 1, status: undefined })}
        >
          Verification queue
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/platform/marketplace/vendor-verification">Legacy queue view</Link>
        </Button>
      </div>

      <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 md:grid-cols-2 lg:grid-cols-5">
        <Input
          placeholder="Search company, legal name, workspace…"
          defaultValue={filters.q ?? ""}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              navigate({ q: event.currentTarget.value.trim() || undefined, page: 1 });
            }
          }}
        />
        <Select
          value={filters.status ?? "all"}
          onValueChange={(value) =>
            navigate({ status: value === "all" ? undefined : (value as PlatformVendorAdminFilters["status"]), page: 1 })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {vendorStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.type ?? "all"}
          onValueChange={(value) =>
            navigate({ type: value === "all" ? undefined : (value as PlatformVendorAdminFilters["type"]), page: 1 })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {VENDOR_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.plan ?? "all"}
          onValueChange={(value) =>
            navigate({ plan: value === "all" ? undefined : (value as PlatformVendorAdminFilters["plan"]), page: 1 })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            {PLAN_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          onClick={() => {
            const q = searchParams.get("q") ?? "";
            navigate({ q: q || undefined, page: 1 });
          }}
        >
          Apply filters
        </Button>
      </div>

      {canModerate && selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
          <span className="text-amber-100">{selected.length} selected</span>
          <Button size="sm" disabled={pending} onClick={() => runBulk("approve")}>
            Bulk approve
          </Button>
          <Button size="sm" variant="destructive" disabled={pending} onClick={() => runBulk("suspend")}>
            Bulk suspend
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full min-w-[960px] text-left text-sm text-zinc-200">
          <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
            <tr>
              {canModerate ? (
                <th className="px-3 py-2">
                  <Checkbox
                    checked={selected.length === result.items.length && result.items.length > 0}
                    onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                    aria-label="Select all vendors"
                  />
                </th>
              ) : null}
              <th className="px-3 py-2">Vendor</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Orders</th>
              <th className="px-3 py-2">Revenue</th>
              <th className="px-3 py-2">Products</th>
              <th className="px-3 py-2">Disputes</th>
              <th className="px-3 py-2">Rating</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={canModerate ? 10 : 9} className="px-3 py-8 text-center text-zinc-500">
                  No vendors match the current filters.
                </td>
              </tr>
            ) : (
              result.items.map((vendor) => (
                <tr key={vendor.id} className="border-t border-zinc-800">
                  {canModerate ? (
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={selected.includes(vendor.id)}
                        onCheckedChange={(checked) => toggleVendor(vendor.id, Boolean(checked))}
                        aria-label={`Select ${vendor.companyName}`}
                      />
                    </td>
                  ) : null}
                  <td className="px-3 py-2">
                    <Link
                      href={`/platform/marketplace/vendors/${vendor.id}`}
                      className="font-medium text-white hover:underline"
                    >
                      {vendor.companyName}
                    </Link>
                    <p className="text-xs text-zinc-500">
                      {vendor.type.replace(/_/g, " ").toLowerCase()}
                      {vendor.workspaceName ? ` · ${vendor.workspaceName}` : ""}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={vendorStatusBadgeVariant(vendor.status)} className="rounded-full">
                      {vendorStatusLabel(vendor.status)}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">{vendor.planTier}</td>
                  <td className="px-3 py-2">{vendor.orderCount}</td>
                  <td className="px-3 py-2">{formatMoney(vendor.revenue)}</td>
                  <td className="px-3 py-2">{vendor.productCount}</td>
                  <td className="px-3 py-2">{vendor.disputeCount}</td>
                  <td className="px-3 py-2">{vendor.avgRating ?? "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/platform/marketplace/vendors/${vendor.id}`}>View</Link>
                      </Button>
                      {canModerate && ["PENDING", "UNDER_REVIEW"].includes(vendor.status) ? (
                        <>
                          <Button size="sm" disabled={pending} onClick={() => runModeration(vendor.id, "approve")}>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={pending}
                            onClick={() => runModeration(vendor.id, "reject")}
                          >
                            Reject
                          </Button>
                        </>
                      ) : null}
                      {canModerate && vendor.status === "APPROVED" ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={pending}
                          onClick={() => runModeration(vendor.id, "suspend")}
                        >
                          Suspend
                        </Button>
                      ) : null}
                      {canModerate && vendor.status === "SUSPENDED" ? (
                        <Button size="sm" disabled={pending} onClick={() => runModeration(vendor.id, "reactivate")}>
                          Reactivate
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>
          {result.total} vendor{result.total === 1 ? "" : "s"} · page {result.page} of {result.totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={result.page <= 1}
            onClick={() => navigate({ page: result.page - 1 })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={result.page >= result.totalPages}
            onClick={() => navigate({ page: result.page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
