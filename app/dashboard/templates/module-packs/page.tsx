import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";

export default async function ModulePacksPage() {
  await getTenantActor();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Module Packs</h1>
        <p className="text-muted-foreground">
          Pre-grouped module sets you can pin together. Module packs ship with
          the workspace starters today.
        </p>
      </div>
      <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">No standalone module packs yet</CardTitle>
          <CardDescription>
            Use a business starter to pin the right modules in one click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="sm">
            <Link href="/dashboard/templates/starters">Browse starters</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
