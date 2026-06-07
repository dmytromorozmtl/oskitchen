import { Check, Minus } from 'lucide-react';

import { cn } from '@/lib/utils';

function ComparisonCell({ value }: { value: string }) {
  const trimmed = value.trim();
  if (trimmed.startsWith('✅')) {
    const detail = trimmed.replace(/^✅\s*/, '');
    return (
      <span className="inline-flex items-start gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
        <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>{detail || 'Included'}</span>
      </span>
    );
  }
  if (trimmed.startsWith('❌')) {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Minus className="h-4 w-4 shrink-0" aria-hidden />
        <span>Not included</span>
      </span>
    );
  }
  return <span className="text-muted-foreground">{value}</span>;
}

type ComparisonTableData = {
  readonly title: string;
  readonly competitorALabel: string;
  readonly competitorBLabel: string;
  readonly rows: ReadonlyArray<{
    readonly feature: string;
    readonly kitchenos: string;
    readonly competitorA: string;
    readonly competitorB: string;
  }>;
};

type Props = {
  comparison: ComparisonTableData;
  comparisonTag: string;
  disclaimer?: string;
};

export function SolutionComparisonTable({ comparison, comparisonTag, disclaimer }: Props) {
  return (
    <section className="py-16 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{comparisonTag}</p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {comparison.title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Feature availability reflects typical positioning — verify current plans with each vendor before you buy.
      </p>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="px-5 py-4 font-semibold text-foreground">Capability</th>
                <th className="px-5 py-4 font-semibold text-primary">OS Kitchen</th>
                <th className="px-5 py-4 font-medium text-muted-foreground">
                  {comparison.competitorALabel}
                </th>
                <th className="px-5 py-4 font-medium text-muted-foreground">
                  {comparison.competitorBLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row, index) => (
                <tr
                  key={row.feature}
                  className={cn(
                    'border-b border-border/70 last:border-0',
                    index % 2 === 1 && 'bg-muted/20',
                  )}
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">{row.feature}</td>
                  <td className="px-5 py-3.5">
                    <ComparisonCell value={row.kitchenos} />
                  </td>
                  <td className="px-5 py-3.5">
                    <ComparisonCell value={row.competitorA} />
                  </td>
                  <td className="px-5 py-3.5">
                    <ComparisonCell value={row.competitorB} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {disclaimer ? (
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{disclaimer}</p>
      ) : null}
    </section>
  );
}
