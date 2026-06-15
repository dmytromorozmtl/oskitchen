import type { ExperimentAuditStreamRow } from "@/services/storefront/storefront-experiment-audit-stream-list";

export function ThemeExperimentAuditStreamTable({ rows }: { rows: ExperimentAuditStreamRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No immutable audit events yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/80">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Action</th>
            <th className="px-3 py-2 font-medium">Severity</th>
            <th className="px-3 py-2 font-medium">Actor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border/60">
              <td className="whitespace-nowrap px-3 py-2 font-mono">
                {r.createdAt.toISOString().replace("T", " ").slice(0, 19)}
              </td>
              <td className="px-3 py-2">{r.action}</td>
              <td className="px-3 py-2">{r.severity ?? "—"}</td>
              <td className="px-3 py-2">{r.actorEmail ?? r.source ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
