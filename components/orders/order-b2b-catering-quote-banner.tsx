import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { readB2bCateringQuoteRollupLink } from "@/lib/integrations/shopify-b2b-catering-rollup-metadata";

export function OrderB2bCateringQuoteBanner({
  sourceMetadataJson,
}: {
  sourceMetadataJson: unknown;
}) {
  const rollup = readB2bCateringQuoteRollupLink(sourceMetadataJson);
  if (!rollup) return null;

  const label = rollup.quoteNumber ?? rollup.quoteId.slice(0, 8);
  const actionLabel = rollup.action === "created" ? "New draft quote" : "Appended to draft";

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="flex items-center gap-2 font-medium text-indigo-950 dark:text-indigo-100">
            <ClipboardList className="size-4 shrink-0" aria-hidden />
            B2B catering rollup · {actionLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            {rollup.lineCount} line(s) rolled into weekly draft{" "}
            <span className="font-mono text-foreground">{rollup.fulfillmentWeekKey}</span>. Review
            before sending the proposal to the client.
          </p>
        </div>
        <Link
          href={`/dashboard/catering-quotes/${rollup.quoteId}`}
          className="shrink-0 rounded-full border border-indigo-500/40 px-3 py-1 text-xs font-medium text-indigo-900 hover:bg-indigo-500/10 dark:text-indigo-100"
        >
          Open quote {label}
        </Link>
      </div>
    </div>
  );
}
