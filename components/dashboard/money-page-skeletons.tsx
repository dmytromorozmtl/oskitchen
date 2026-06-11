import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SKELETON_SURFACE_CLASS } from "@/lib/design/loading-skeleton-patterns";

/** POS register checkout — menu grid + cart panel with checkout CTA (Blueprint P1-29). */
export function POSCheckoutSkeleton({
  variant = "register",
  className,
}: {
  variant?: "register" | "mobile";
  className?: string;
}) {
  if (variant === "mobile") {
    return (
      <div
        className={cn("relative mx-auto max-w-md space-y-3 pb-36", className)}
        data-testid="pos-checkout-skeleton-mobile"
        aria-busy="true"
        aria-label="Loading mobile POS checkout"
      >
        <LoadingSkeleton className="h-28 w-full rounded-2xl" />
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-14 w-full rounded-2xl" />
        ))}
        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md space-y-2 rounded-t-3xl border border-border/80 bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
          <LoadingSkeleton className="h-4 w-24 rounded-full" />
          <LoadingSkeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid min-h-[480px] gap-3 lg:grid-cols-[minmax(0,1fr)_320px]",
        className,
      )}
      data-testid="pos-checkout-skeleton"
      aria-busy="true"
      aria-label="Loading POS checkout"
    >
      <div className={cn("flex min-h-[420px] flex-col gap-3 rounded-xl border p-3", SKELETON_SURFACE_CLASS)}>
        <LoadingSkeleton className="h-10 w-full max-w-md" />
        <div className="grid flex-1 grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
      <div className={cn("space-y-3 rounded-xl border p-3", SKELETON_SURFACE_CLASS)}>
        <LoadingSkeleton className="h-6 w-24" />
        <LoadingSkeleton className="h-24 w-full rounded-lg" />
        <LoadingSkeleton className="h-24 w-full rounded-lg" />
        <div className="space-y-2 border-t border-border/60 pt-3">
          <div className="flex justify-between">
            <LoadingSkeleton className="h-4 w-16" />
            <LoadingSkeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <LoadingSkeleton className="h-4 w-20" />
            <LoadingSkeleton className="h-5 w-24" />
          </div>
        </div>
        <LoadingSkeleton className="h-14 w-full rounded-2xl" />
        <LoadingSkeleton className="h-11 w-full rounded-full" />
      </div>
    </div>
  );
}

/** Marketplace cart checkout — line items + order summary + pay CTAs (Blueprint P1-29). */
export function MarketplaceCartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("space-y-6 pb-8", className)}
      data-testid="marketplace-cart-skeleton"
      aria-busy="true"
      aria-label="Loading marketplace cart"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <LoadingSkeleton className="h-8 w-40" />
          <LoadingSkeleton className="h-4 w-72 max-w-full" />
        </div>
        <LoadingSkeleton className="h-10 w-40 rounded-full" />
      </div>

      <LoadingSkeleton className="h-12 w-full rounded-xl" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className={cn(SKELETON_SURFACE_CLASS, "shadow-sm")}>
              <CardHeader className="pb-2">
                <LoadingSkeleton className="h-5 w-48" />
                <LoadingSkeleton className="mt-2 h-4 w-32" />
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <LoadingSkeleton className="h-10 w-24 rounded-full" />
                <LoadingSkeleton className="h-10 w-20 rounded-full" />
                <LoadingSkeleton className="h-10 w-20 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className={cn(SKELETON_SURFACE_CLASS, "shadow-sm")}>
            <CardHeader>
              <LoadingSkeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex justify-between">
                  <LoadingSkeleton className="h-4 w-20" />
                  <LoadingSkeleton className="h-4 w-16" />
                </div>
              ))}
              <LoadingSkeleton className="h-5 w-full" />
            </CardContent>
          </Card>
          <Card className={cn(SKELETON_SURFACE_CLASS, "shadow-sm")}>
            <CardHeader>
              <LoadingSkeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <LoadingSkeleton className="h-10 w-full rounded-xl" />
              <LoadingSkeleton className="h-11 w-full rounded-full" />
              <LoadingSkeleton className="h-11 w-full rounded-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** Vendor finance — balance KPIs, revenue chart, transactions table (Blueprint P1-29). */
export function VendorFinanceSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("space-y-6 pb-8", className)}
      data-testid="vendor-finance-skeleton"
      aria-busy="true"
      aria-label="Loading vendor finance"
    >
      <div className="space-y-2">
        <LoadingSkeleton className="h-8 w-32" />
        <LoadingSkeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className={cn(SKELETON_SURFACE_CLASS, "shadow-sm")}>
            <CardHeader className="pb-2">
              <LoadingSkeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent>
              <LoadingSkeleton className="h-8 w-24" />
              <LoadingSkeleton className="mt-2 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <LoadingSkeleton className="h-10 w-36 rounded-full" />
        <LoadingSkeleton className="h-10 w-44 rounded-full" />
      </div>

      <Card className={cn(SKELETON_SURFACE_CLASS, "shadow-sm")}>
        <CardHeader>
          <LoadingSkeleton className="h-5 w-48" />
          <LoadingSkeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <LoadingSkeleton className="h-72 w-full rounded-lg" />
        </CardContent>
      </Card>

      <Card className={cn(SKELETON_SURFACE_CLASS, "shadow-sm")}>
        <CardHeader>
          <LoadingSkeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <LoadingSkeleton className="h-10 w-full max-w-md rounded-full" />
            <LoadingSkeleton className="h-10 w-44 rounded-full" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-12 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
