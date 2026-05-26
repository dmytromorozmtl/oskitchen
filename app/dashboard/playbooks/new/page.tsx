import { CustomPlaybookForm } from "@/components/dashboard/playbooks/custom-playbook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";

export default async function NewPlaybookPage() {
  await getTenantActor();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create custom playbook</h1>
        <p className="text-muted-foreground">
          Define a workflow with steps, roles, and module links. You can run it
          later from the Playbooks command center.
        </p>
      </div>
      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Workflow</CardTitle>
          <CardDescription>
            Steps will be presented to staff in this order. Task generation only
            happens when an operator clicks &ldquo;Generate tasks&rdquo; on a run.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomPlaybookForm />
        </CardContent>
      </Card>
    </div>
  );
}
