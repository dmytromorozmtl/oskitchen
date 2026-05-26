import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UsageBar } from "@/lib/billing/usage-limits";

const TONE_CLASS: Record<UsageBar["tone"], string> = {
  ok: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

export function UsageBars({ bars }: { bars: UsageBar[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Usage this month</CardTitle>
        <CardDescription>Soft warnings appear at 80%. Hard limits surface in entitlement checks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {bars.map((b) => (
          <div key={b.metric} className="text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span>{b.label}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {b.limit === null ? `${b.used} · Unlimited` : `${b.used} / ${b.limit}`}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-muted">
              <div className={`h-full ${TONE_CLASS[b.tone]}`} style={{ width: `${Math.min(100, b.percent)}%` }} />
            </div>
            {b.tone === "danger" ? (
              <p className="mt-1 text-xs text-rose-700">Over plan limit — consider upgrading.</p>
            ) : b.tone === "warning" ? (
              <p className="mt-1 text-xs text-amber-700">Approaching plan limit.</p>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
