import { redirect } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getActiveProject } from "@/services/implementation/implementation-service";

export default async function GlobalChecklistPage() {
  const { userId } = await requireTenantActor();
  const active = await getActiveProject(userId);
  if (active) redirect(`/dashboard/implementation/${active.id}/checklist`);

  return (
    <Card>
      <CardHeader>
        <CardTitle>No active project</CardTitle>
        <CardDescription>Create an implementation project to see its checklist.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/dashboard/implementation/new" className="text-sm text-primary underline">
          Start implementation
        </Link>
      </CardContent>
    </Card>
  );
}
