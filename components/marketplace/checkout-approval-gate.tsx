import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MARKETPLACE_CHECKOUT_APPROVAL_LIMIT_USD,
  marketplaceCheckoutRequiresApproval,
} from "@/lib/marketplace/checkout-utils";
import { cn, formatCurrency } from "@/lib/utils";

export type CheckoutApprovalGateProps = {
  subtotal: number;
  currency?: string;
  approvalLimitUsd?: number;
  className?: string;
};

export function CheckoutApprovalGate({
  subtotal,
  currency = "USD",
  approvalLimitUsd = MARKETPLACE_CHECKOUT_APPROVAL_LIMIT_USD,
  className,
}: CheckoutApprovalGateProps) {
  const requiresApproval = marketplaceCheckoutRequiresApproval(subtotal, approvalLimitUsd);

  if (!requiresApproval) {
    return (
      <div
        role="status"
        data-testid="checkout-approval-gate-auto"
        className={cn(
          "rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm",
          className,
        )}
      >
        <p className="font-medium text-emerald-950 dark:text-emerald-100">Auto-submit eligible</p>
        <p className="mt-1 text-muted-foreground">
          Subtotal at or below {formatCurrency(approvalLimitUsd, currency)} submits directly as purchase
          orders.
        </p>
      </div>
    );
  }

  return (
    <Card
      role="status"
      data-testid="checkout-approval-gate-required"
      className={cn(
        "border-amber-300/70 bg-amber-50 shadow-none dark:border-amber-800 dark:bg-amber-950/40",
        className,
      )}
    >
      <CardContent className="flex gap-3 py-4">
        <ClipboardCheck
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-800 dark:text-amber-200"
          aria-hidden
        />
        <div className="space-y-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-amber-950 dark:text-amber-50">Manager approval required</p>
            <Badge variant="outline" className="rounded-full border-amber-400/60 text-[10px] uppercase">
              Approval gate
            </Badge>
          </div>
          <p className="text-amber-900/90 dark:text-amber-100/90">
            Your cart subtotal ({formatCurrency(subtotal, currency)}) exceeds{" "}
            {formatCurrency(approvalLimitUsd, currency)}. Checkout creates purchase orders in{" "}
            <span className="font-medium">Pending approval</span> until a workspace owner approves them.
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full border-amber-400/60 bg-background/80"
          >
            <Link href="/dashboard/marketplace/orders?status=PENDING_APPROVAL">
              View pending approvals
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
