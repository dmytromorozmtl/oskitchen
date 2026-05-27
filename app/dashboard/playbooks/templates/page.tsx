import Link from "next/link";

import { StartRunButton } from "@/components/dashboard/playbooks/start-run-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requirePlaybooksPageAccess } from "@/lib/playbooks/playbook-page-access";
import { listPlaybooks } from "@/services/playbooks/playbook-service";

export default async function TemplatesPage() {
  const access = await requirePlaybooksPageAccess("playbooks.view");
  if (!access.ok) return access.deny;
  const { tenantScope: scope } = access;
  const templates = await listPlaybooks(scope, { systemOnly: true });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System Templates</h1>
        <p className="text-muted-foreground">
          Built-in playbooks shipped with KitchenOS. Run as-is or copy into a custom playbook.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {templates.map((p) => (
          <Card key={p.id} className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{p.title}</CardTitle>
              <CardDescription>{p.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                {p.steps.map((s) => (
                  <li key={s.id}>{s.title}</li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-2">
                <StartRunButton playbookId={p.id} label="Run" size="sm" />
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/playbooks/${p.id}`}>Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
