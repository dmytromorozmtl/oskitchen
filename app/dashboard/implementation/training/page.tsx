import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getActiveProject } from "@/services/implementation/implementation-service";

export default async function GlobalTrainingPage() {
  const { userId } = await requireTenantActor();
  const active = await getActiveProject(userId);
  if (active) redirect(`/dashboard/implementation/${active.id}/training`);
  return (
    <Card>
      <CardHeader>
        <CardTitle>No active project</CardTitle>
        <CardDescription>Create a project to manage role-based training.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/dashboard/training" className="text-sm text-primary underline">
          Open Training module
        </Link>
      </CardContent>
    </Card>
  );
}
