import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VISUAL_QA_POS_PRODUCTS } from "@/lib/qa/visual-qa-p3-55-fixtures";
import { formatCurrency } from "@/lib/utils";

/** Static POS tablet layout for Playwright visual QA baselines. */
export function VisualPosTabletShell() {
  const cartTotal = 26.5;

  return (
    <div className="space-y-4" data-testid="visual-pos-tablet">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">POS Tablet</h1>
          <p className="text-sm text-muted-foreground">Register #2 · Shift open</p>
        </div>
        <Badge variant="secondary">Tablet mode</Badge>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {VISUAL_QA_POS_PRODUCTS.map((product) => (
            <button
              key={product.id}
              type="button"
              className="rounded-2xl border border-border/80 bg-card p-4 text-left shadow-sm transition hover:border-primary/40"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {product.category}
              </p>
              <p className="mt-2 font-semibold">{product.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatCurrency(product.price, "USD")}
              </p>
            </button>
          ))}
        </div>

        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Current order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Power Bowl ×1</span>
              <span>{formatCurrency(14.5, "USD")}</span>
            </div>
            <div className="flex justify-between">
              <span>Green Smoothie ×1</span>
              <span>{formatCurrency(8.0, "USD")}</span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-3 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(cartTotal, "USD")}</span>
            </div>
            <Button className="w-full rounded-xl">Complete sale</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
