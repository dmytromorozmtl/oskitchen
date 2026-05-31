import { CreditCard } from "lucide-react";

import { readKitchenOrderB2bMetadata } from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import { Badge } from "@/components/ui/badge";

export function OrderB2bCommercialTermsBanner({
  sourceMetadataJson,
}: {
  sourceMetadataJson: unknown;
}) {
  const b2b = readKitchenOrderB2bMetadata(sourceMetadataJson);
  if (!b2b?.paymentTerms && !b2b?.poNumber && !b2b?.missingPo) return null;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <CreditCard className="size-4 shrink-0 text-emerald-800 dark:text-emerald-200" aria-hidden />
        <span className="font-medium text-emerald-950 dark:text-emerald-100">B2B commercial terms</span>
        {b2b.paymentTerms?.label ? (
          <Badge variant="outline" className="rounded-full border-emerald-500/40 text-xs">
            {b2b.paymentTerms.label}
          </Badge>
        ) : null}
        {b2b.poNumber ? (
          <Badge variant="outline" className="rounded-full border-emerald-500/40 font-mono text-xs">
            PO#{b2b.poNumber}
          </Badge>
        ) : null}
        {b2b.missingPo ? (
          <Badge variant="destructive" className="rounded-full text-xs">
            PO required — missing on import
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

export function OrderB2bCommercialTermsBadges({
  sourceMetadataJson,
}: {
  sourceMetadataJson: unknown;
}) {
  const b2b = readKitchenOrderB2bMetadata(sourceMetadataJson);
  if (!b2b?.paymentTerms && !b2b?.poNumber && !b2b?.missingPo) return null;

  return (
    <>
      {b2b.paymentTerms?.label ? (
        <Badge
          variant="outline"
          className="rounded-full border-emerald-500/40 text-[10px] text-emerald-900 dark:text-emerald-100"
        >
          {b2b.paymentTerms.label}
        </Badge>
      ) : null}
      {b2b.poNumber ? (
        <Badge
          variant="outline"
          className="rounded-full border-emerald-500/40 font-mono text-[10px] text-emerald-900 dark:text-emerald-100"
        >
          PO#{b2b.poNumber}
        </Badge>
      ) : null}
      {b2b.missingPo ? (
        <Badge variant="destructive" className="rounded-full text-[10px]">
          PO required
        </Badge>
      ) : null}
    </>
  );
}
