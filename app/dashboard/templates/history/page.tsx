import Link from "next/link";

import { RollbackButton } from "@/components/dashboard/templates/rollback-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { canUseTemplates } from "@/lib/templates/template-permissions";
import { requireTemplatesPageAccess } from "@/lib/templates/template-page-access";
import {
  parseRollbackPlan,
  rollbackAvailability,
} from "@/lib/templates/template-rollback";
import { listApplications } from "@/services/templates/template-service";

const STATUS_TONE: Record<string, string> = {
  PREVIEWED: "bg-muted text-muted-foreground",
  APPLYING: "bg-amber-100 text-amber-900",
  APPLIED: "bg-emerald-100 text-emerald-900",
  PARTIALLY_APPLIED: "bg-sky-100 text-sky-900",
  FAILED: "bg-rose-100 text-rose-900",
  ROLLED_BACK: "bg-slate-100 text-slate-900",
};

export default async function TemplateHistoryPage() {
  const access = await requireTemplatesPageAccess("templates.history");
  if (!access.ok) return access.deny;
  const { tenantScope: scope, scope: actorScope } = access;
  const canRollback = canUseTemplates(actorScope, "templates.rollback");
  const apps = await listApplications(scope, 100);

  if (apps.length === 0) {
    return (
      <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">No templates applied yet</CardTitle>
          <CardDescription>
            Preview and apply a starter template to configure modules,
            playbooks, and setup tasks safely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="sm">
            <Link href="/dashboard/templates">Choose a template</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Applied history</h1>
        <p className="text-muted-foreground">
          Every preview and apply is recorded here for review and safe rollback.
        </p>
      </div>
      <div className="space-y-3">
        {apps.map((a) => {
          const plan = parseRollbackPlan(a.rollbackJson);
          const availability =
            a.status === "APPLIED" || a.status === "PARTIALLY_APPLIED"
              ? rollbackAvailability(plan)
              : ("none" as const);
          return (
            <Card key={a.id} className="border-border/80 bg-card/90 shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    {a.template?.title ?? a.templateKey}
                  </CardTitle>
                  <Badge className={`rounded-full ${STATUS_TONE[a.status] ?? ""}`}>
                    {a.status}
                  </Badge>
                </div>
                <CardDescription>
                  v{a.templateVersion} · {a.applyMode.replaceAll("_", " ").toLowerCase()} ·
                  applied by {a.appliedBy ?? "—"}
                  {a.appliedAt ? ` · ${a.appliedAt.toLocaleString()}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3 text-sm">
                <div className="text-xs text-muted-foreground">
                  Sections:{" "}
                  {(a.selectedSectionsJson as string[] | null)?.join(", ") ?? "—"}
                </div>
                {canRollback ? (
                  <RollbackButton applicationId={a.id} available={availability} />
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
