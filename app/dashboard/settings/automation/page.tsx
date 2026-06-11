import { notFound } from "next/navigation";

import { AutomationForm } from "@/components/dashboard/settings/forms/automation-form";
import { BridgeCard } from "@/components/dashboard/settings/bridge-card";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";
import { loadSettingsCenter } from "@/services/settings/settings-center-service";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
const TEMPLATES = [
  { when: "Order delayed > 30 min", then: "Notify GM + escalate to manager", category: "Orders" },
  { when: "Production behind SLA", then: "Open production alert + assign extra station", category: "Production" },
  { when: "Shortage detected on tomorrow's prep", then: "Email purchasing lead + flag in Ingredient Demand", category: "Inventory" },
  { when: "VIP customer placed an order", then: "Notify owner + add VIP tag", category: "CRM" },
  { when: "Delivery route running late", then: "SMS the customer with new ETA", category: "Delivery" },
  { when: "Webhook failed 3 times", then: "Pause integration + open developer alert", category: "Integrations" },
];

export default async function AutomationSettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = { userId, email: profile?.email ?? session.email ?? null, role: (profile?.role ?? null) as string | null };
  if (!canUseSettings(actor, "manage_automation")) {
    return <PermissionDeniedSurfaceCard surfaceId="settings_workspace" />;
  }
  const { payload } = await loadSettingsCenter(userId);

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="automation" />
      <BridgeCard
        title="Workspace automations"
        description="IF/THEN rules live inside each module: notification rules, channel rules, and operational reminders. Use the defaults below to control retry behavior platform-wide."
        href="/dashboard/notifications/rules"
        ctaLabel="Open notification rules"
        status={payload.automation.enabled ? { label: "Enabled", tone: "ok" } : { label: "Paused", tone: "warn" }}
        secondaryActions={[
          { label: "Sales channel rules", href: "/dashboard/sales-channels/rules" },
        ]}
      />
      <AutomationForm initial={payload.automation} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Starter templates</CardTitle>
          <CardDescription>Drop these patterns into Automation Studio when getting started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {TEMPLATES.map((t) => (
            <div key={t.when} className="rounded-xl border border-border/70 bg-background/80 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{t.when}</p>
                <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">→ {t.then}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
