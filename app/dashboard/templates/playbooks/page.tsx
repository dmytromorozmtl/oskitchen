import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireTemplatesPageAccess } from "@/lib/templates/template-page-access";

export default async function TemplatesPlaybooksPage() {
  const access = await requireTemplatesPageAccess("templates.view");
  if (!access.ok) return access.deny;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Playbook templates</h1>
        <p className="text-muted-foreground">
          Operations Playbooks ships its own template library. Templates here
          group playbooks with module pins for new workspaces.
        </p>
      </div>
      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Looking for SOPs?</CardTitle>
          <CardDescription>
            The Operations Playbooks center owns SOP templates and run history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="sm">
            <Link href="/dashboard/playbooks/templates">Open Playbook templates</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
