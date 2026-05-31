import Link from "next/link";

import { BULK_APPROVABLE, CONFIDENCE_LABEL } from "@/lib/product-mapping/matching-confidence";

type Props = {
  blockedOrderLines: number;
  openConflictMappings: number;
};

const BULK_LABELS = BULK_APPROVABLE.map((k) => CONFIDENCE_LABEL[k]).join(", ");

export function WorkbenchSafetyCallout({ blockedOrderLines, openConflictMappings }: Props) {
  const hasRisk = blockedOrderLines > 0 || openConflictMappings > 0;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/70 bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Human gate:</span> suggestions are deterministic scores, not
          proof of the right prep item. Approve only after you have checked the OS Kitchen target — especially for
          allergens, price tiers, and modifiers.
        </p>
        <p className="mt-2">
          <span className="font-medium text-foreground">Bulk approve:</span> only{" "}
          <span className="text-foreground">{BULK_LABELS}</span> rows are eligible; medium/low matches must be reviewed
          individually.
        </p>
      </div>

      {hasRisk ? (
        <div
          className="flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div>
            <p className="font-semibold">Mapping risk detected</p>
            <ul className="mt-1 list-inside list-disc text-xs">
              {blockedOrderLines > 0 ? (
                <li>
                  {blockedOrderLines} open order line conflict{blockedOrderLines === 1 ? "" : "s"} tied to missing
                  product mapping.
                </li>
              ) : null}
              {openConflictMappings > 0 ? (
                <li>
                  {openConflictMappings} product mapping row{openConflictMappings === 1 ? "" : "s"} in{" "}
                  <span className="font-medium">CONFLICT</span> status.
                </li>
              ) : null}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/order-hub?tab=needs_mapping"
              className="inline-flex items-center justify-center rounded-full border border-amber-700/40 bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-amber-100/80"
            >
              Order Hub · needs mapping
            </Link>
            <Link
              href="/dashboard/product-mapping/conflicts"
              className="inline-flex items-center justify-center rounded-full border border-amber-700/40 bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-amber-100/80"
            >
              Open conflicts
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
