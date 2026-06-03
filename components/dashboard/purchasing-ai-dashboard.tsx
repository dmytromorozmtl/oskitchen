"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";

import {
  adjustAiPurchaseQuantityAction,
  orderAiPurchaseItemAction,
  orderAllAiPurchasesAction,
  skipAiPurchaseItemAction,
  unskipAiPurchaseItemAction,
} from "@/actions/ai-purchasing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  DAYS_TONE_CLASS,
  DAYS_TONE_DOT,
} from "@/lib/ai/ai-purchasing-dashboard-builders";
import type { PurchasingAiDashboardPayload, PurchasingAiRow } from "@/lib/ai/ai-purchasing-dashboard-types";
import { cn } from "@/lib/utils";

type Props = PurchasingAiDashboardPayload;

const URGENCY_VARIANT: Record<PurchasingAiRow["urgency"], "destructive" | "default" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "default",
  normal: "secondary",
  low: "outline",
};

function DaysRemainingBadge({ row }: { row: PurchasingAiRow }) {
  const label =
    row.daysRemaining != null ? `${row.daysRemaining.toFixed(1)}d left` : "No usage data";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        DAYS_TONE_CLASS[row.daysTone],
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", DAYS_TONE_DOT[row.daysTone])} aria-hidden />
      {label}
    </span>
  );
}

function RecommendationRow({
  row,
  onRefresh,
}: {
  row: PurchasingAiRow;
  onRefresh: () => void;
}) {
  const [qty, setQty] = useState(String(row.orderQuantity));
  const [skipOpen, setSkipOpen] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [pending, startTransition] = useTransition();

  function orderOne() {
    startTransition(async () => {
      const res = await orderAiPurchaseItemAction(row.ingredientId);
      if ("error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Draft PO created for ${row.ingredientName}`);
      if ("warnings" in res && res.warnings?.length) {
        res.warnings.forEach((w) => toast.warning(w));
      }
      if ("poId" in res && res.poId) {
        window.location.href = `/dashboard/purchasing/purchase-orders/${res.poId}`;
      } else {
        onRefresh();
      }
    });
  }

  function saveQty() {
    const n = Number(qty);
    startTransition(async () => {
      const res = await adjustAiPurchaseQuantityAction(row.ingredientId, n);
      if ("error" in res && res.error) toast.error(res.error);
      else {
        toast.success("Quantity updated");
        onRefresh();
      }
    });
  }

  function confirmSkip() {
    startTransition(async () => {
      const res = await skipAiPurchaseItemAction(row.ingredientId, skipReason);
      if ("error" in res && res.error) toast.error(res.error);
      else {
        toast.success(`Skipped ${row.ingredientName}`);
        setSkipOpen(false);
        onRefresh();
      }
    });
  }

  return (
    <>
      <tr className="border-b border-border/60 hover:bg-muted/20">
        <td className="py-3 pr-3">
          <div className="font-medium">{row.ingredientName}</div>
          <div className="text-xs text-muted-foreground">{row.category ?? "Uncategorized"}</div>
        </td>
        <td className="py-3 pr-3">
          <DaysRemainingBadge row={row} />
          <div className="text-xs text-muted-foreground mt-1">
            Stock {row.currentStock} {row.unit}
          </div>
        </td>
        <td className="py-3 pr-3 text-sm tabular-nums">
          {row.dailyUsage} / day
          <div className="text-xs text-muted-foreground">14d: {row.predictedDemand14d}</div>
        </td>
        <td className="py-3 pr-3">
          <div className="font-medium text-sm">{row.bestSupplier.supplierName}</div>
          <div className="text-xs text-muted-foreground">
            ${row.bestSupplier.unitCost.toFixed(2)}/{row.unit} · EOQ {row.bestSupplier.eoq}
          </div>
          {row.alternativeSupplier && row.alternativeSupplier.savingsPerOrder > 0 ? (
            <div className="text-xs text-emerald-600 mt-0.5">
              Alt {row.alternativeSupplier.supplierName}: save ${row.alternativeSupplier.savingsPerOrder.toFixed(2)}
            </div>
          ) : null}
        </td>
        <td className="py-3 pr-3">
          <div className="flex items-center gap-1 max-w-[120px]">
            <Input
              type="number"
              min={0.1}
              step={0.1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="h-8 text-sm"
              aria-label={`Quantity for ${row.ingredientName}`}
            />
            <Button type="button" size="sm" variant="ghost" className="h-8 px-2" disabled={pending} onClick={saveQty}>
              Set
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1">${row.bestSupplier.orderTotal.toFixed(2)}</div>
        </td>
        <td className="py-3 pr-3">
          <Badge variant={URGENCY_VARIANT[row.urgency]}>{row.urgency}</Badge>
          <div className="text-[10px] text-muted-foreground mt-1">{Math.round(row.confidence * 100)}% conf.</div>
        </td>
        <td className="py-3">
          <div className="flex flex-wrap gap-1">
            <Button type="button" size="sm" disabled={pending} onClick={orderOne}>
              Order
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => setSkipOpen(true)}>
              <SkipForward className="h-3.5 w-3.5 mr-1" aria-hidden />
              Skip
            </Button>
          </div>
        </td>
      </tr>

      <Dialog open={skipOpen} onOpenChange={setSkipOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip {row.ingredientName}</DialogTitle>
            <DialogDescription>Record why this AI recommendation should not be ordered right now.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`skip-${row.ingredientId}`}>Reason</Label>
            <Input
              id={`skip-${row.ingredientId}`}
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="e.g. Already ordered from local market"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSkipOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={pending || !skipReason.trim()} onClick={confirmSkip}>
              Skip item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PurchasingAiDashboard(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showSkipped, setShowSkipped] = useState(false);

  const savingsPercent = useMemo(() => {
    if (props.summary.totalEstimatedSpend <= 0) return 0;
    return Math.min(
      100,
      (props.summary.totalPotentialSavings / props.summary.totalEstimatedSpend) * 100,
    );
  }, [props.summary.totalEstimatedSpend, props.summary.totalPotentialSavings]);

  function refresh() {
    router.refresh();
  }

  function orderAll() {
    startTransition(async () => {
      const res = await orderAllAiPurchasesAction();
      if ("error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Created ${res.poIds?.length ?? 0} draft PO(s) for ${res.count} items`);
      if ("warnings" in res && res.warnings?.length) {
        res.warnings.forEach((w) => toast.warning(w));
      }
      if ("poIds" in res && res.poIds?.length === 1) {
        window.location.href = `/dashboard/purchasing/purchase-orders/${res.poIds[0]}`;
      } else {
        refresh();
      }
    });
  }

  return (
    <div className="space-y-6" data-testid="purchasing-ai-dashboard">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Purchasing</h1>
          <p className="text-muted-foreground max-w-2xl">
            AI-assisted purchase recommendations — EOQ quantities, 14-day demand forecast, supplier savings.
            Confidence {Math.round(props.confidence * 100)}%. Updated{" "}
            {new Date(props.analyzedAt).toLocaleString()}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" data-testid="auto-ordering-link">
            <Link href="/dashboard/inventory/auto-ordering">Auto-ordering</Link>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={pending || props.activeRows.length === 0}
            onClick={orderAll}
          >
            <ShoppingCart className="mr-2 h-4 w-4" aria-hidden />
            Order All ({props.activeRows.length})
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" aria-hidden />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{props.activeRows.length}</p>
            <p className="text-sm text-muted-foreground">
              {props.summary.criticalCount} critical · {props.summary.highCount} high
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Est. spend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">${props.summary.totalEstimatedSpend.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">Active recommendations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" aria-hidden />
              Savings tracker
            </CardTitle>
            <CardDescription>Vs alternative suppliers on same qty</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-600">
              ${props.summary.totalPotentialSavings.toFixed(0)}
            </p>
            <Progress className="mt-2 h-2" value={savingsPercent} />
            <p className="text-xs text-muted-foreground mt-1">{savingsPercent.toFixed(0)}% of spend optimizable</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Skipped</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{props.skippedRows.length}</p>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={() => setShowSkipped((v) => !v)}
            >
              {showSkipped ? "Hide skipped" : "Show skipped"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommended orders</CardTitle>
          <CardDescription>
            Days remaining color: red ≤1d · amber ≤3d · yellow ≤7d · green. Adjust qty, order individually, or skip with reason.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {props.activeRows.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No active recommendations — run ingredient demand or add supplier catalog items.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="p-3 font-medium">Ingredient</th>
                  <th className="p-3 font-medium">Days left</th>
                  <th className="p-3 font-medium">Usage</th>
                  <th className="p-3 font-medium">Supplier</th>
                  <th className="p-3 font-medium">Qty</th>
                  <th className="p-3 font-medium">Priority</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {props.activeRows.map((row) => (
                  <RecommendationRow key={row.ingredientId} row={row} onRefresh={refresh} />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {showSkipped && props.skippedRows.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skipped items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {props.skippedRows.map((row) => (
              <div key={row.ingredientId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                <div>
                  <span className="font-medium">{row.ingredientName}</span>
                  <p className="text-xs text-muted-foreground">{row.skipReason}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const res = await unskipAiPurchaseItemAction(row.ingredientId);
                      if ("error" in res && res.error) toast.error(res.error);
                      else {
                        toast.success("Restored to recommendations");
                        refresh();
                      }
                    });
                  }}
                >
                  Restore
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-dashed">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
          <p className="text-muted-foreground">
            Orders create draft POs grouped by supplier — review and approve in Purchasing.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/purchasing/purchase-orders">
              Purchase orders
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
