import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StripeDiagnostics } from "@/lib/billing/stripe-config";

export function StripeDiagnosticsCard({ diagnostics }: { diagnostics: StripeDiagnostics }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Stripe diagnostics</CardTitle>
        <CardDescription>
          Presence only. Never displays secret values.{" "}
          {diagnostics.liveMode === true ? "Currently in live mode." : diagnostics.liveMode === false ? "Currently in test mode." : "Mode unknown — secret missing."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-3">Key</th>
              <th className="py-2 pr-3">Group</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Shape</th>
            </tr>
          </thead>
          <tbody>
            {diagnostics.rows.map((row) => (
              <tr key={row.key} className="border-b align-top">
                <td className="py-2 pr-3 font-mono text-xs">{row.key}</td>
                <td className="py-2 pr-3 text-xs text-muted-foreground">{row.group}</td>
                <td className="py-2 pr-3 text-xs">
                  {row.present
                    ? <span className="text-emerald-700">present</span>
                    : row.required
                      ? <span className="text-rose-700">missing (required)</span>
                      : <span className="text-muted-foreground">missing (optional)</span>}
                </td>
                <td className="py-2 pr-3 text-xs text-muted-foreground">
                  {row.shape ?? (row.hint ? row.hint : "—")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
