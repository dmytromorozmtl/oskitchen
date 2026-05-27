import { TemplateCard } from "@/components/dashboard/templates/template-card";
import { canUseTemplates } from "@/lib/templates/template-permissions";
import { requireTemplatesPageAccess } from "@/lib/templates/template-page-access";
import { WORKSPACE_TEMPLATE_REGISTRY } from "@/lib/templates/template-registry";
import { listApplications } from "@/services/templates/template-service";

export default async function AllTemplatesPage() {
  const access = await requireTemplatesPageAccess("templates.view");
  if (!access.ok) return access.deny;
  const { tenantScope: scope, scope: actorScope } = access;
  const canApply = canUseTemplates(actorScope, "templates.apply");
  const history = await listApplications(scope, 200);
  const appliedKeys = new Set(
    history
      .filter((a) => a.status === "APPLIED" || a.status === "PARTIALLY_APPLIED")
      .map((a) => a.templateKey),
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">All Templates</h1>
        <p className="text-muted-foreground">
          Every workspace template — system starters and module packs.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {WORKSPACE_TEMPLATE_REGISTRY.map((t) => (
          <TemplateCard
            key={t.key}
            template={t}
            applied={appliedKeys.has(t.key)}
            canApply={canApply}
          />
        ))}
      </div>
    </div>
  );
}
