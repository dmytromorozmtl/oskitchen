import { notFound } from "next/navigation";

import { AiForm } from "@/components/dashboard/settings/forms/ai-form";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";
import { loadSettingsCenter } from "@/services/settings/settings-center-service";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
export default async function AiSettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = { userId, email: profile?.email ?? session.email ?? null, role: (profile?.role ?? null) as string | null };
  if (!canUseSettings(actor, "manage_ai")) {
    return <PermissionDeniedSurfaceCard surfaceId="settings_workspace" />;
  }
  const { payload } = await loadSettingsCenter(userId);

  const providerKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY ? "configured" : "missing";

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="ai" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Provider</CardTitle>
          <CardDescription>The active AI provider is selected via environment variables.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <Badge variant="outline" className={providerKey === "configured" ? "border-emerald-500/50 text-emerald-700" : "border-amber-500/50 text-amber-700"}>
            {providerKey === "configured" ? "Provider key configured" : "No provider key detected"}
          </Badge>
        </CardContent>
      </Card>
      <AiForm initial={payload.ai} />
    </div>
  );
}
