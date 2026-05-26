import { TemplateCard } from "@/components/dashboard/templates/template-card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { WORKSPACE_TEMPLATE_REGISTRY } from "@/lib/templates/template-registry";

export default async function BusinessStartersPage() {
  await getTenantActor();
  const starters = WORKSPACE_TEMPLATE_REGISTRY.filter(
    (t) => t.category === "WORKSPACE_STARTER",
  );
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Business Starters</h1>
        <p className="text-muted-foreground">
          One template per primary operating mode. Safe to preview at any time.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {starters.map((t) => (
          <TemplateCard key={t.key} template={t} />
        ))}
      </div>
    </div>
  );
}
