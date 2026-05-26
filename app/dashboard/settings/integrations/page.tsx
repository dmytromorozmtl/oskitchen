import { notFound } from "next/navigation";

import { BridgeCard } from "@/components/dashboard/settings/bridge-card";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getCachedIntegrationConnectionListWhere } from "@/lib/scope/cached-workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { getStripeDiagnostics } from "@/lib/billing/stripe-config";
import { getResendDiagnostics } from "@/lib/notifications/provider-resend";
import { canUseSettings } from "@/lib/settings/settings-permissions";

export default async function IntegrationsSettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = { userId, email: profile?.email ?? session.email ?? null, role: (profile?.role ?? null) as string | null };
  if (!canUseSettings(actor, "manage_integrations")) notFound();

  const connectionWhere = await getCachedIntegrationConnectionListWhere();
  const connections = await prisma.integrationConnection
    .findMany({
      where: connectionWhere,
      orderBy: { createdAt: "desc" },
      take: 20,
    })
    .catch(() => []);

  const stripe = (() => { try { return getStripeDiagnostics(); } catch { return null; } })();
  const resend = (() => { try { return getResendDiagnostics(); } catch { return null; } })();

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="integrations" />
      <BridgeCard
        title="Integrations"
        description="Stripe, Resend, channels, POS, courier providers, and other external services."
        href="/dashboard/integrations"
        ctaLabel="Manage integrations"
        status={connections.length > 0 ? { label: `${connections.length} active`, tone: "ok" } : { label: "None connected", tone: "warn" }}
        stats={[
          { label: "Connections", value: connections.length.toString(), tone: connections.length > 0 ? "ok" : "warn" },
          { label: "Stripe", value: stripe?.configured ? "Ready" : "Not configured", tone: stripe?.configured ? "ok" : "warn" },
          { label: "Resend", value: resend?.sendingEnabled ? "Ready" : "Not configured", tone: resend?.sendingEnabled ? "ok" : "warn" },
        ]}
      />
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connected providers</CardTitle>
            <CardDescription>Detailed health and credential rotation are available in the Integrations Center.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {connections.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/80 p-3 text-sm">
                <div>
                  <p className="font-medium">{c.name} <span className="text-xs text-muted-foreground">({c.provider})</span></p>
                  <p className="text-xs text-muted-foreground">Created {c.createdAt.toISOString().slice(0, 10)}{c.lastSyncAt ? ` · last sync ${c.lastSyncAt.toISOString().slice(0, 10)}` : ""}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
