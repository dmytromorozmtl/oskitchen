import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getActiveProject } from "@/services/implementation/implementation-service";

export default async function GlobalRisksPage() {
  const { userId } = await requireTenantActor();
  const active = await getActiveProject(userId);
  if (active) redirect(`/dashboard/implementation/${active.id}/risks`);
  return (
    <Card>
      <CardHeader>
        <CardTitle>No active project</CardTitle>
        <CardDescription>Create a project to log risks and mitigations.</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
