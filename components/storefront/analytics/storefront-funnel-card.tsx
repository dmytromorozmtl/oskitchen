export function StorefrontFunnelCard({
  funnel,
  conversionRate,
}: {
  funnel: { step: string; count: number }[];
  conversionRate: number;
}) {
  const max = Math.max(1, ...funnel.map((f) => f.count));
  return (
    <div className="rounded-2xl border border-border/80 p-4 shadow-sm">
      <p className="text-sm font-medium">Funnel</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Visit → order rate: <span className="font-mono tabular-nums">{(conversionRate * 100).toFixed(2)}%</span>
      </p>
      <ul className="mt-4 space-y-3">
        {funnel.map((f) => (
          <li key={f.step}>
            <div className="flex justify-between text-xs">
              <span>{f.step}</span>
              <span className="tabular-nums text-muted-foreground">{f.count}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(f.count / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
