import { NewProjectWizard } from "@/components/dashboard/implementation/new-project-wizard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createImplementationActorScope } from "@/lib/implementation/implementation-actor-scope";
import { canUseImplementation } from "@/lib/implementation/implementation-permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";

export default async function NewImplementationPage() {
  const actor = await requireWorkspacePermissionActor();
  const scope = createImplementationActorScope(actor);
  if (!canUseImplementation(scope, "implementation.create")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No access</CardTitle>
          <CardDescription>You do not have permission to create implementation projects.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  const profile = await prisma.userProfile.findUnique({
    where: { id: actor.userId },
    select: { companyName: true },
  });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Start implementation</h1>
        <p className="text-sm text-muted-foreground">
          Capture business profile, scope, and go-live target. No data is imported, no templates are applied, no
          integrations are connected.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Safety</CardTitle>
          <CardDescription>
            This wizard creates a planning project with a phased checklist. It does <strong>not</strong> touch live
            orders, customers, menus, or invoices. Imports and integrations are configured later in their own
            modules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewProjectWizard initialBusinessName={profile?.companyName ?? null} />
        </CardContent>
      </Card>
    </div>
  );
}
