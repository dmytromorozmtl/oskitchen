import type { PnlReconciliationSeverity } from "@/lib/accounting/pnl-reconciliation-view-absolute-final-policy";

export const PNL_RECONCILIATION_SEVERITY_META: Record<
  PnlReconciliationSeverity,
  { label: string; description: string }
> = {
  synced: {
    label: "Synced",
    description: "P&L statement and journal GL amounts match within tolerance.",
  },
  minor: {
    label: "Minor variance",
    description: "Variance under 5% — review timing or rounding before period close.",
  },
  material: {
    label: "Material variance",
    description: "Variance ≥5% — investigate mapping, missing entries, or data lag.",
  },
};
