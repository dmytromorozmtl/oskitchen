export function StorefrontSourceTable({ rows }: { rows: { ref: string; count: number }[] }) {
  if (!rows.length) {
    return <p className="text-sm text-muted-foreground">No referrer data for this window.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/80">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border/80 bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Referrer (truncated)</th>
            <th className="px-3 py-2 font-medium">Visits</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.ref} className="border-b border-border/60 last:border-0">
              <td className="max-w-md truncate px-3 py-2 font-mono text-xs">{r.ref}</td>
              <td className="px-3 py-2 tabular-nums">{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
