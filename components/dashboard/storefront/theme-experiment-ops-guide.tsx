import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ThemeExperimentOpsGuide() {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Decision ops (owner playbook)</CardTitle>
        <CardDescription>
          When to use one-click Apply winner vs manual publish, and when Traffic sanity matters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div>
          <p className="font-medium text-foreground">Apply winner (publish + end)</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Use when recommendation is <strong>publish_draft</strong>, edge sync is idle, and GA4/CSV agree draft wins.</li>
            <li>Publishes draft snapshot to live theme and auto-disables experiment + clears Edge Config.</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">Manual publish</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Use when you need to review draft in Theme builder first, or edge jobs are still QUEUED.</li>
            <li>Publish on Theme page still auto-ends the experiment after success.</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">Traffic sanity (SRM)</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Warns if observed draft % drifts &gt;5 pp from configured traffic (n≥500).</li>
            <li>Investigate bots, ad campaigns, or cookie loss before trusting lift.</li>
            <li>Slack alert: cron <code className="rounded bg-muted px-1 text-xs">/api/cron/storefront-experiment-srm</code> (deduped 24h).</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">On-call (edge DLQ)</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Retry edge sync on Advanced → verify EDGE_CONFIG_ID, VERCEL_API_TOKEN, TEAM_ID.</li>
            <li>Runbook: <code className="rounded bg-muted px-1 text-xs">npm run ops:edge-sync-runbook</code></li>
            <li>PagerDuty critical: <code className="rounded bg-muted px-1 text-xs">PAGERDUTY_ROUTING_KEY_DLQ</code></li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">Phase G+ (parity, compliance, kill switch)</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>GA4 auto parity: SEO → numeric property ID + server <code className="rounded bg-muted px-1 text-xs">GA4_SERVICE_ACCOUNT_JSON</code>.</li>
            <li>Compliance: Export audit CSV (90d) — <code className="rounded bg-muted px-1 text-xs">storefront.experiment.*</code>.</li>
            <li>Kill switch: uncheck Experiment pipeline or <code className="rounded bg-muted px-1 text-xs">THEME_EXPERIMENT_DISABLED=1</code>.</li>
            <li>Checklist: <code className="rounded bg-muted px-1 text-xs">npm run ops:phase-g-prod-wiring</code></li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">Phase H (automation &amp; compliance)</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>GA4 parity cron every 6h — drift alert after 2 cycles.</li>
            <li>Signed audit export + weekly S3/webhook archive cron.</li>
            <li>Edge SLO p95 &lt; 60s on this page.</li>
            <li>Game day: <code className="rounded bg-muted px-1 text-xs">npm run ops:game-day-experiment-drill</code></li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">Phase I (auto-conclude &amp; budget)</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>
              <Link href="/dashboard/storefront/settings/experiments" className="text-primary underline-offset-4 hover:underline">
                Settings → Experiments
              </Link>{" "}
              — pipeline, auto-conclude, audit stream.
            </li>
            <li>Auto-conclude: all gates pass → 24h grace email → publish draft + end experiment.</li>
            <li>GA4 parity error budget on Advanced (3 drift-days / 30d).</li>
            <li>Checklist: <code className="rounded bg-muted px-1 text-xs">npm run ops:phase-i-prod-wiring</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
