import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getActiveProject } from "@/services/implementation/implementation-service";

export default async function GlobalIntegrationsPage() {
  const { userId } = await requireTenantActor();
  const active = await getActiveProject(userId);
  if (active) redirect(`/dashboard/implementation/${active.id}/integrations`);
  return (
    <Card>
      <CardHeader>
        <CardTitle>No active project</CardTitle>
        <CardDescription>Create a project to track integration setup.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/dashboard/integrations" className="text-sm text-primary underline">
          Open Integrations
        </Link>
      </CardContent>
    </Card>
  );
}
