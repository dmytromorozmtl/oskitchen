import { notFound } from "next/navigation";

import { BridgeCard } from "@/components/dashboard/settings/bridge-card";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
const DEFAULT_ROLES: { key: string; description: string }[] = [
  { key: "Owner", description: "Full workspace administration." },
  { key: "Admin", description: "Operations, settings, integrations — no destructive actions." },
  { key: "Manager", description: "Day-to-day operations across orders, production, delivery, CRM." },
  { key: "Kitchen lead", description: "Production + packing + QC." },
  { key: "Customer service", description: "Orders, customers, notifications visibility." },
  { key: "Driver", description: "Delivery + routes on mobile." },
  { key: "Staff", description: "Limited read-only visibility into assigned areas." },
];

export default async function StaffSettingsBridgePage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = { userId, email: profile?.email ?? session.email ?? null, role: (profile?.role ?? null) as string | null };
  if (!canUseSettings(actor, "manage_staff")) {
    return <PermissionDeniedSurfaceCard surfaceId="settings_workspace" />;
  }

  const [staffCount, pendingCount] = await Promise.all([
    prisma.staffMember.count({ where: { userId, active: true } }).catch(() => 0),
    prisma.staffMember.count({ where: { userId, status: "INVITED" } }).catch(() => 0),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="staff" />
      <BridgeCard
        title="Workforce Management Center"
        description="RBAC roles, invitations, per-location/per-brand permissions, training, and certifications live in the Staff Center."
        href="/dashboard/staff"
        ctaLabel="Open Staff Center"
        status={staffCount > 0 ? { label: `${staffCount} member${staffCount === 1 ? "" : "s"}`, tone: "ok" } : { label: "Owner only", tone: "warn" }}
        stats={[
          { label: "Members", value: staffCount.toString(), tone: staffCount > 0 ? "ok" : "warn" },
          { label: "Pending", value: pendingCount.toString(), tone: pendingCount > 0 ? "warn" : "neutral" },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Role catalog</CardTitle>
          <CardDescription>Default role templates. Customize role permissions in the Staff Center.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {DEFAULT_ROLES.map((r) => (
            <div key={r.key} className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-background/80 p-3">
              <div>
                <p className="font-medium text-sm">{r.key}</p>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">Template</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
