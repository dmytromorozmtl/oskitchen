import type { Soc2Manifest } from "@/services/storefront/experiment-soc2-s3-service";

function storeCountMap(manifest: Soc2Manifest): Map<string, number> {
  return new Map(manifest.stores.map((s) => [s.storeSlug, s.rowCount]));
}

export function ExperimentAuditManifestDiff({
  current,
  previous,
}: {
  current: Soc2Manifest | null;
  previous: Soc2Manifest | null;
}) {
  if (!current) {
    return <p className="text-sm text-muted-foreground">No current manifest in S3.</p>;
  }
  if (!previous) {
    return (
      <p className="text-sm text-muted-foreground">
        First manifest snapshot ({new Date(current.generatedAt).toLocaleDateString()}) — no prior week to
        compare.
      </p>
    );
  }

  const cur = storeCountMap(current);
  const prev = storeCountMap(previous);
  const slugs = new Set([...cur.keys(), ...prev.keys()]);

  const rows = [...slugs].map((slug) => {
    const c = cur.get(slug) ?? 0;
    const p = prev.get(slug) ?? 0;
    return { slug, c, p, delta: c - p };
  });

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Week-over-week: {new Date(previous.generatedAt).toLocaleDateString()} →{" "}
        {new Date(current.generatedAt).toLocaleDateString()}
      </p>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="pb-1">Store</th>
            <th className="pb-1">Prev rows</th>
            <th className="pb-1">Current</th>
            <th className="pb-1">Δ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.slug} className="border-t border-border/40 font-mono">
              <td className="py-1">{r.slug}</td>
              <td>{r.p}</td>
              <td>{r.c}</td>
              <td className={r.delta > 0 ? "text-emerald-600" : r.delta < 0 ? "text-amber-600" : ""}>
                {r.delta > 0 ? "+" : ""}
                {r.delta}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
