import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getActiveProject } from "@/services/implementation/implementation-service";

export default async function GlobalActivityPage() {
  const { userId } = await requireTenantActor();
  const active = await getActiveProject(userId);
  if (active) redirect(`/dashboard/implementation/${active.id}/activity`);
  return (
    <Card>
      <CardHeader>
        <CardTitle>No active project</CardTitle>
        <CardDescription>Create a project to see the audit timeline.</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
