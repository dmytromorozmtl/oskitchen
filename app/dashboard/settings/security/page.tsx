import { notFound } from "next/navigation";

import { BridgeCard } from "@/components/dashboard/settings/bridge-card";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
const SECURITY_CHECKLIST = [
  { label: "Two-factor authentication", description: "Manage in Supabase auth — Settings linkout coming." },
  { label: "Active sessions", description: "Sign out other devices from the user profile." },
  { label: "Enterprise SSO (pilot)", description: "Configure Supabase SAML SSO for one pilot tenant — not production for all customers." },
  { label: "Audit logs", description: "Inspect sensitive workspace events." },
  { label: "Webhook secrets", description: "Resend, Stripe, integration secrets are environment-managed." },
];

export default async function SecuritySettingsBridgePage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = { userId, email: profile?.email ?? session.email ?? null, role: (profile?.role ?? null) as string | null };
  if (!canUseSettings(actor, "manage_security")) {
    return <PermissionDeniedSurfaceCard surfaceId="settings_workspace" />;
  }

  const [apiKeyCount, recentAuditEvents] = await Promise.all([
    prisma.apiKey.count({ where: { userId, active: true } }).catch(() => 0),
    prisma.auditLog.count({
      where: { userId, createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) } },
    }).catch(() => 0),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="security" />
      <BridgeCard
        title="Security Center"
        description="Two-factor, sessions, IP restrictions, API keys, webhook secrets, and audit history."
        href="/dashboard/audit-logs"
        ctaLabel="Open audit logs"
        status={{ label: "Active", tone: "ok" }}
        stats={[
          { label: "Active API keys", value: apiKeyCount.toString(), tone: apiKeyCount > 0 ? "ok" : "warn" },
          { label: "Audit events (30d)", value: recentAuditEvents.toString(), tone: "neutral" },
        ]}
        secondaryActions={[
          { label: "API keys", href: "/dashboard/developer/api-keys" },
          { label: "SSO pilot (Enterprise)", href: "/dashboard/settings/security/sso" },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Security checklist</CardTitle>
          <CardDescription>Recommended hardening. Items marked as “env-managed” live in deployment secrets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {SECURITY_CHECKLIST.map((c) => (
            <div key={c.label} className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-background/80 p-3">
              <div>
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.description}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">Operator</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
