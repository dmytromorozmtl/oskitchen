import { AlertTriangle } from "lucide-react";

import type { CostingVarianceAlert } from "@/services/costing/costing-alert-service";

type VarianceAlert = Pick<
  CostingVarianceAlert,
  "productName" | "variancePercent" | "theoreticalCost" | "actualCost"
>;

export function VarianceAlertBanner({ alerts }: { alerts: VarianceAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            Cost variance alert — {alerts.length} product{alerts.length > 1 ? "s" : ""}
          </h3>
          <ul className="mt-2 space-y-1">
            {alerts.map((a) => (
              <li key={a.productName} className="text-sm text-amber-700 dark:text-amber-300">
                <span className="font-medium">{a.productName}</span>: theoretical ${a.theoreticalCost.toFixed(2)} vs
                actual ${a.actualCost.toFixed(2)} ({a.variancePercent}% variance)
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Review recipes, receiving, or supplier prices when variance exceeds your threshold.
          </p>
        </div>
      </div>
    </div>
  );
}
