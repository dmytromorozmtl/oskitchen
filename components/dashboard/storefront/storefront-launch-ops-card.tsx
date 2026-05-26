import { AlertTriangle, Check, Circle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateStorefrontReleaseEnv,
  storefrontReleaseEnvSummary,
} from "@/lib/storefront/storefront-release-env";
import { storefrontPaymentReadiness } from "@/services/storefront/storefront-payment-service";

type SfPayFields = Parameters<typeof storefrontPaymentReadiness>[0];

function EnvRow({
  label,
  passed,
  detail,
  level,
}: {
  label: string;
  passed: boolean;
  detail: string;
  level: "critical" | "warning" | "info";
}) {
  return (
    <li className="flex items-start gap-3 text-sm">
      {passed ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
      ) : level === "critical" ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
      ) : (
        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
      )}
      <div>
        <span className="font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{detail}</span>
      </div>
    </li>
  );
}

export function StorefrontLaunchOpsCard({
  settings,
}: {
  settings: SfPayFields | null;
}) {
  const pay = settings ? storefrontPaymentReadiness(settings) : null;
  const requireStripe = Boolean(
    settings?.onlinePaymentEnabled && !settings?.payLaterOnly,
  );
  const checks = evaluateStorefrontReleaseEnv({
    requireStripe,
    requireEmail: false,
  });
  const summary = storefrontReleaseEnvSummary(checks);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>Production &amp; ops readiness</CardTitle>
        <CardDescription>
          Server-side env checks (values never shown). Run locally:{" "}
          <code className="rounded bg-muted px-1 text-xs">npm run check-env:storefront</code>
          . HTTP smoke:{" "}
          <code className="rounded bg-muted px-1 text-xs">npm run smoke:storefront-release</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {pay ? (
          <div>
            <p className="text-sm font-medium">Payment mode</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {settings?.payLaterOnly
                ? "Pay-later only — Stripe not required for guests."
                : settings?.onlinePaymentEnabled
                  ? pay.allowed
                    ? "Online card checkout is configured and aligned."
                    : `Online payments enabled but blocked: ${pay.blockedReason ?? "see Ordering tab"}`
                  : "Online payments off — guests use pay-later only."}
            </p>
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-sm font-medium">
            Environment{" "}
            {summary.allCriticalPassed ? (
              <span className="text-emerald-700 dark:text-emerald-400">(critical OK)</span>
            ) : (
              <span className="text-destructive">({summary.criticalFailed} critical missing)</span>
            )}
          </p>
          <ul className="space-y-2">
            {checks.map((c) => (
              <EnvRow key={c.id} label={c.label} passed={c.passed} detail={c.detail} level={c.level} />
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
