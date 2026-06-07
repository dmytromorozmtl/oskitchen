import Link from "next/link";

import { PlanGate } from "@/components/plans/plan-gate";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { WHITE_LABEL_STOREFRONT_DEPTH_ROUTE } from "@/lib/storefront/white-label-storefront-depth-absolute-final-policy";

export default async function WhiteLabelSettingsPage() {
  const { userId } = await getTenantActor();
  return (
    <PlanGate userId={userId} feature="api_access" title="Enterprise white-label settings">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">White-label settings</h1>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={WHITE_LABEL_STOREFRONT_DEPTH_ROUTE}>ChowNow parity depth</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Custom logo", "Configured in branding settings today."],
            ["Brand color", "Available for storefront and email theme placeholders."],
            ["Custom domain", "Placeholder only; DNS automation is not implemented."],
            ["Hide OS Kitchen branding", "Enterprise placeholder, already gated."],
            ["White-label storefront", "Use brand-specific storefront readiness and custom domain plan."],
            ["White-label quote/order tracking", "Roadmap item; do not promise custom domains yet."],
          ].map(([title, desc]) => (
            <Card key={title}><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{desc}</CardDescription></CardHeader></Card>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href={WHITE_LABEL_STOREFRONT_DEPTH_ROUTE} className="text-sm text-primary underline underline-offset-4">
            Open white-label storefront depth dashboard
          </Link>
          <Link href="/docs/CUSTOM_DOMAIN_SETUP.md" className="text-sm text-primary underline underline-offset-4">
            Custom domain setup doc
          </Link>
        </div>
      </div>
    </PlanGate>
  );
}
