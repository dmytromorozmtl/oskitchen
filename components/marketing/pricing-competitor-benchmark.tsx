import Link from "next/link";

import {
  PRICING_COMPETITOR_BENCHMARK_DISCLAIMER,
  PRICING_COMPETITOR_BENCHMARK_METHODOLOGY,
  PRICING_COMPETITOR_BENCHMARK_ROWS,
  formatPublishedOsKitchenPriceRange,
} from "@/lib/marketing/pricing-competitor-benchmark";
import { A11Y_INLINE_LINK } from "@/lib/a11y/ui-classes";

export function PricingCompetitorBenchmark() {
  return (
    <section className="mt-20" aria-labelledby="competitor-benchmark-heading">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Competitor benchmark
        </p>
        <h2 id="competitor-benchmark-heading" className="mt-3 text-2xl font-semibold tracking-tight">
          How published pricing compares
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          OS Kitchen publishes software list prices on this page —{" "}
          <strong className="font-medium text-foreground">{formatPublishedOsKitchenPriceRange()}</strong>.
          Compare typical incumbent bundles before your pilot conversation.{" "}
          <Link href="/compare/toast" className={A11Y_INLINE_LINK}>
            Toast compare
          </Link>
          {" · "}
          <Link href="/compare/square" className={A11Y_INLINE_LINK}>
            Square compare
          </Link>
        </p>
      </div>

      <div
        data-testid="pricing-competitor-benchmark"
        className="mt-10 overflow-x-auto rounded-2xl border border-border/80"
      >
        <table className="w-full min-w-[720px] text-sm" aria-label="Competitor pricing benchmark">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Dimension</th>
              <th className="px-4 py-3 text-left font-medium">Toast</th>
              <th className="px-4 py-3 text-left font-medium">Square</th>
              <th className="px-4 py-3 text-left font-medium">Lightspeed</th>
              <th className="px-4 py-3 text-left font-medium">TouchBistro</th>
              <th className="px-4 py-3 text-left font-medium text-primary">OS Kitchen</th>
            </tr>
          </thead>
          <tbody>
            {PRICING_COMPETITOR_BENCHMARK_ROWS.map((row) => (
              <tr key={row.dimension} className="border-t border-border/60">
                <td className="px-4 py-3 font-medium">{row.dimension}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.toast}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.square}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.lightspeed}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.touchbistro}</td>
                <td className="px-4 py-3 font-medium text-foreground">{row.osKitchen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">{PRICING_COMPETITOR_BENCHMARK_DISCLAIMER}</p>
      <p className="mt-2 text-center text-xs text-muted-foreground">{PRICING_COMPETITOR_BENCHMARK_METHODOLOGY}</p>
    </section>
  );
}
