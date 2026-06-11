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

export default async function ImportTemplatesPage() {
  const access = await requireTemplatesPageAccess("templates.view");
  if (!access.ok) return access.deny;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import templates</h1>
        <p className="text-muted-foreground">
          CSV / Sheet templates for menus, customers, and recipes.
        </p>
      </div>
      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Use the Import Center</CardTitle>
          <CardDescription>
            Templates link here for safe data import. The Import Center owns the
            CSV schemas, dry-runs, and conflict resolution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="sm">
            <Link href="/dashboard/import-center">Open Import Center</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
