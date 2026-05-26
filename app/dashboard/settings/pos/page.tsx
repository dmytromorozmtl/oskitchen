import { notFound } from "next/navigation";

import { POS_OFFLINE_LIMITATIONS } from "@/lib/pos/pos-offline";
import { POS_HARDWARE_CATEGORIES } from "@/lib/pos/pos-hardware";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";

export default async function PosWorkspaceSettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = {
    userId,
    email: profile?.email ?? session.email ?? null,
    role: (profile?.role ?? null) as string | null,
  };
  if (!canUseSettings(actor, "manage_orders")) notFound();

  const prefs = await prisma.kitchenModulePreference.findMany({
    where: { userId, moduleKey: "pos_terminal" },
    select: { enabled: true },
  });
  const posEnabled = prefs.length === 0 ? true : Boolean(prefs[0]?.enabled);

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="pos" />
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Module state</CardTitle>
          <CardDescription>POS Terminal follows the same module toggles as the rest of the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 text-sm">
          <span>POS module preference:</span>
          <Badge variant={posEnabled ? "default" : "outline"}>{posEnabled ? "Enabled" : "Disabled"}</Badge>
        </CardContent>
      </Card>
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Offline limitations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {POS_OFFLINE_LIMITATIONS.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </CardContent>
      </Card>
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Hardware checklist</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {POS_HARDWARE_CATEGORIES.map((h) => (
            <div key={h.id} className="rounded-xl border border-border/70 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{h.label}</span>
                <Badge variant="outline">{h.status}</Badge>
              </div>
              <p className="mt-2 text-muted-foreground">{h.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
