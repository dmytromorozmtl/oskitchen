import Link from "next/link";

import { FoodopsWorkflowStepper } from "@/components/orders/foodops-workflow-stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FoodopsWorkflowStepView } from "@/services/workflows/foodops-workflow-service";

export function OrderWorkflowSummaryCard({
  orderId,
  steps,
  canOpenFixRoutes,
}: {
  orderId: string;
  steps: FoodopsWorkflowStepView[];
  canOpenFixRoutes?: boolean;
}) {
  const blocked = steps.filter((s) => s.status === "blocked").length;
  const current = steps.find((s) => s.status === "current");

  return (
    <Card className="border-border/80">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">FoodOps workflow</CardTitle>
            <CardDescription>
              End-to-end operational chain for this order — statuses follow the same blockers as pipeline actions.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {blocked > 0 ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                {blocked} blocked
              </Badge>
            ) : (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                No blocked steps
              </Badge>
            )}
            {current ? (
              <Badge variant="outline" className="max-w-[220px] truncate rounded-full text-[10px] font-normal">
                Focus: {current.label}
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="hidden md:block">
          <FoodopsWorkflowStepper steps={steps} canOpenFixRoutes={canOpenFixRoutes} />
        </div>
        <div className="md:hidden">
          <FoodopsWorkflowStepper steps={steps} compact canOpenFixRoutes={canOpenFixRoutes} />
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={`/dashboard/orders/${orderId}?tab=fulfillment`}>Fulfillment tab</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/order-hub">Order hub</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
