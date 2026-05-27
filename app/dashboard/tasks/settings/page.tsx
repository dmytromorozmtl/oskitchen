import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import { tasksTerminologyForMode } from "@/lib/tasks/task-types";

export default async function TasksSettingsPage() {
  const actor = await requireWorkspacePermissionActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: actor.userId },
    include: { kitchenSettings: { select: { businessType: true } } },
  });
  const mode = profile?.kitchenSettings?.businessType ?? null;
  const terminology = tasksTerminologyForMode(mode);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Task settings</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Current business mode and operator role determine the default terminology and which templates are surfaced.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business mode</CardTitle>
          <CardDescription>Drives header copy and template visibility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Mode: <Badge variant="outline" className="ml-1 rounded-full">{mode ?? "—"}</Badge></p>
          <p>Title: <span className="font-medium">{terminology.title}</span></p>
          <p>Default task type: <Badge variant="secondary" className="ml-1 rounded-full">{terminology.defaultType}</Badge></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Access</CardTitle>
          <CardDescription>Coarse permission summary until WorkspaceMember.role lands.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Signed in as <span className="font-medium">{actor.email ?? "(no email)"}</span></p>
          <p>
            Superadmin override:{" "}
            <Badge variant={actor.platformBypass ? "default" : "outline"} className="rounded-full">
              {actor.platformBypass ? "enabled" : "disabled"}
            </Badge>
          </p>
          <p className="text-muted-foreground">
            Owners see all tasks for their workspace. Staff see tasks assigned to them or their role.
            Managers can assign, cancel, and bulk update. Drivers and packers see route / pack tasks only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
