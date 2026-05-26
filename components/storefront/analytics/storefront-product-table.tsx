export function StorefrontProductTable({
  rows,
}: {
  rows: { productId: string; title: string; count: number }[];
}) {
  if (!rows.length) {
    return <p className="text-sm text-muted-foreground">No product-level events yet (fires on menu and product views).</p>;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/80">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border/80 bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Product</th>
            <th className="px-3 py-2 font-medium">Views / adds</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.productId} className="border-b border-border/60 last:border-0">
              <td className="px-3 py-2">{r.title}</td>
              <td className="px-3 py-2 tabular-nums">{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
