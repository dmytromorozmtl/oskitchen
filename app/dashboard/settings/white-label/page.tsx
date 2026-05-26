import Link from "next/link";

import { PlanGate } from "@/components/plans/plan-gate";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";

export default async function WhiteLabelSettingsPage() {
  const { userId } = await getTenantActor();
  return (
    <PlanGate userId={userId} feature="api_access" title="Enterprise white-label settings">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight">White-label settings</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Custom logo", "Configured in branding settings today."],
            ["Brand color", "Available for storefront and email theme placeholders."],
            ["Custom domain", "Placeholder only; DNS automation is not implemented."],
            ["Hide KitchenOS branding", "Enterprise placeholder, already gated."],
            ["White-label storefront", "Use brand-specific storefront readiness and custom domain plan."],
            ["White-label quote/order tracking", "Roadmap item; do not promise custom domains yet."],
          ].map(([title, desc]) => (
            <Card key={title}><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{desc}</CardDescription></CardHeader></Card>
          ))}
        </div>
        <Link href="/docs/CUSTOM_DOMAIN_SETUP.md" className="text-sm text-primary underline underline-offset-4">Custom domain setup doc</Link>
      </div>
    </PlanGate>
  );
}
