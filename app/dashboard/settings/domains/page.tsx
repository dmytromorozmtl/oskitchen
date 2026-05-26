import { notFound } from "next/navigation";

import { BridgeCard } from "@/components/dashboard/settings/bridge-card";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";

export default async function DomainsSettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = { userId, email: profile?.email ?? session.email ?? null, role: (profile?.role ?? null) as string | null };
  if (!canUseSettings(actor, "manage_domains")) notFound();

  const domains = await prisma.storefrontDomain.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="domains" />
      <BridgeCard
        title="Custom domains"
        description="Mapped domains for storefronts and quote/order tracking. DNS automation is operator-driven; we surface readiness."
        href="/dashboard/storefronts"
        ctaLabel="Manage storefront domains"
        status={{ label: domains.length > 0 ? `${domains.length} mapped` : "None mapped", tone: domains.length > 0 ? "ok" : "warn" }}
        stats={[
          { label: "Mapped domains", value: domains.length.toString(), tone: domains.length > 0 ? "ok" : "warn" },
          { label: "Verified", value: domains.filter((d) => d.status === "VERIFIED").length.toString(), tone: "neutral" },
        ]}
      />
      {domains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connected domains</CardTitle>
            <CardDescription>Verification + SSL signals come from the storefront domain service.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {domains.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/80 p-3 text-sm">
                <div>
                  <p className="font-medium">{d.domain}</p>
                  <p className="text-xs text-muted-foreground">Type: {d.type} · Last checked: {d.lastCheckedAt ? d.lastCheckedAt.toISOString().slice(0, 10) : "never"}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{d.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
