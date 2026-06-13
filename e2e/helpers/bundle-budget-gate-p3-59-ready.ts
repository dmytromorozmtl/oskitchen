import { isBundleBudgetGateP3_59Enabled } from "@/lib/qa/bundle-budget-gate-p3-59-policy";

export function bundleBudgetGateP3_59Ready(): boolean {
  return isBundleBudgetGateP3_59Enabled();
}
