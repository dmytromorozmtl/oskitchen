import Link from "next/link";

import {
  BetaBadge,
  InternalBadge,
  PlaceholderBadge,
  PreviewBadge,
} from "@/components/ui/beta-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function SkippedBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="secondary"
      title="SKIPPED — smoke not run or credentials missing; not a fake PASS"
      className={cn(
        "rounded-full px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide",
        "border border-sky-500/40 bg-sky-500/10 text-sky-950 dark:text-sky-100",
        className,
      )}
    >
      Skipped
    </Badge>
  );
}

function PilotReadyBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="secondary"
      title="Pilot ready — qualified for design partner / paid pilot with documented caveats"
      className={cn(
        "rounded-full px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide",
        "border border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
        className,
      )}
    >
      Pilot ready
    </Badge>
  );
}

function LiveBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="secondary"
      title="LIVE — staging smoke PASS with real credentials in your workspace"
      className={cn(
        "rounded-full px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide",
        "border border-green-600/40 bg-green-600/10 text-green-950 dark:text-green-100",
        className,
      )}
    >
      Live
    </Badge>
  );
}

const MATURITY_ROWS = [
  {
    badge: <PilotReadyBadge />,
    label: "Pilot ready",
    meaning:
      "Core workflow is qualified for design partner or paid pilot SOW. Documented caveats apply — not “production certified for all tenants.”",
    where: "Order hub, storefront, KDS, production, packing, billing",
    sales: "Safe to demo and contract in pilot scope with Era 17 ICP gates.",
  },
  {
    badge: <BetaBadge />,
    label: "BETA",
    meaning:
      "Engineering shipped; partner credentials, staging smoke, or migration may still be required before a LIVE claim.",
    where: "Marketplace, Woo/Shopify until live proof, AI modules, delivery adapters",
    sales: "Show Integration Health — never hide the badge in customer demos.",
  },
  {
    badge: <PreviewBadge />,
    label: "Preview",
    meaning:
      "UI and routes exist; behavior may change. Visible when “Show all modules” is on — not default pilot nav.",
    where: "Early nav entries, experimental dashboards",
    sales: "Do not promise GA dates unless on public roadmap with evidence.",
  },
  {
    badge: <SkippedBadge />,
    label: "SKIPPED",
    meaning:
      "Honest state: smoke not run, credentials missing, or ops vault not configured. SKIPPED is not PASS — we refuse fake green tiles.",
    where: "Integration Health Center, P0 orchestrator artifacts, channel live proof",
    sales: "Explain what is needed to move SKIPPED → PASS; never imply the channel is live.",
  },
  {
    badge: <PlaceholderBadge />,
    label: "Placeholder",
    meaning: "Shell route or scaffold without operational backend. Do not sell until matrix promotes to BETA or LIVE.",
    where: "Nav maturity hide list, preview-only routes",
    sales: "Redirect to pilot_ready modules in scope.",
  },
  {
    badge: <InternalBadge />,
    label: "Internal",
    meaning: "Platform or CS tooling — not a customer-facing product promise.",
    where: "Platform admin, impersonation, ops vault",
    sales: "Not for prospect decks.",
  },
  {
    badge: <LiveBadge />,
    label: "LIVE",
    meaning:
      "Your workspace passed live-integration definition of done: real credentials, webhook proof, honest artifact on file.",
    where: "Integration Health when smoke PASS — rare at pre-scale (June 2026 baseline: 0 LIVE in registry)",
    sales: "Only claim LIVE when Integration Health shows PASS with artifact link.",
  },
] as const;

const FAQ = [
  [
    "Why show SKIPPED instead of hiding broken integrations?",
    "Operators lose orders when a “connected” badge lies. Integration Health and SKIPPED states are our honesty moat vs Toast/Square dashboards that assume partner stacks work.",
  ],
  [
    "Does BETA mean broken?",
    "No — it means not certified LIVE for every tenant yet. Many BETA modules work in staging with your credentials; sales must qualify scope in LOI/SOW.",
  ],
  [
    "Can sales remove badges in demos?",
    "No — forbidden claims training requires visible BETA/SKIPPED labels. Run MARKETING_CLAIMS_STRICT=1 npm run verify-claims before external materials.",
  ],
  [
    "Where is the source of truth?",
    "docs/feature-maturity-matrix.md for modules; Integration Health Center for your workspace; artifacts/pilot-gono-go-summary.json for pilot GO/NO-GO.",
  ],
] as const;

/** Public explanation of BETA / Preview / SKIPPED maturity labels (MKT-08). */
export function TrustMaturityLabelsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6" aria-labelledby="maturity-labels-heading">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Feature honesty</p>
        <h2 id="maturity-labels-heading" className="text-2xl font-semibold tracking-tight">
          BETA, Preview, and SKIPPED — what the badges mean
        </h2>
        <p className="text-muted-foreground">
          OS Kitchen labels every integration and module with honest maturity. Labels appear in
          dashboard nav, Integration Health, and sales demos — they are not errors to hide.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {MATURITY_ROWS.map((row) => (
          <Card key={row.label} className="border-border/80">
            <CardHeader className="space-y-3 pb-2">
              <div className="flex flex-wrap items-center gap-2">
                {row.badge}
                <CardTitle className="text-base">{row.label}</CardTitle>
              </div>
              <CardDescription className="text-sm leading-relaxed">{row.meaning}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Where: </span>
                {row.where}
              </p>
              <p>
                <span className="font-medium text-foreground">Sales: </span>
                {row.sales}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
        <p className="font-semibold text-amber-950 dark:text-amber-100">Integration Health rule</p>
        <p className="mt-2 text-sm text-muted-foreground">
          PASS = verified in your workspace · SKIPPED = honest “not proven yet” · FAILED = action
          required. We never upgrade SKIPPED to PASS in marketing copy or GO/NO-GO artifacts without
          captured smoke proof.
        </p>
        <p className="mt-4 text-sm">
          <Link href="/integrations" className="font-medium text-primary underline-offset-4 hover:underline">
            Integration capability matrix
          </Link>
          {" · "}
          <Link
            href="/dashboard/integration-health"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Integration Health (sign in)
          </Link>
        </p>
      </div>

      <div className="mt-12 space-y-4">
        <h3 className="text-xl font-semibold">FAQ</h3>
        {FAQ.map(([q, a]) => (
          <div key={q} className="rounded-xl border border-border/80 bg-muted/20 p-4">
            <p className="font-medium">{q}</p>
            <p className="mt-2 text-sm text-muted-foreground">{a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
