import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getActiveProject } from "@/services/implementation/implementation-service";

export default async function GlobalMigrationPage() {
  const { userId } = await requireTenantActor();
  const active = await getActiveProject(userId);
  if (active) redirect(`/dashboard/implementation/${active.id}/migration`);
  return (
    <Card>
      <CardHeader>
        <CardTitle>No active project</CardTitle>
        <CardDescription>Create a project to plan data migration.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/dashboard/import-center" className="text-sm text-primary underline">
          Open Import Center
        </Link>
      </CardContent>
    </Card>
  );
}
