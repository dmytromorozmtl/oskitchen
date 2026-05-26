import Link from "next/link";

import { TemplateCard } from "@/components/dashboard/templates/template-card";
import { TemplateKpis } from "@/components/dashboard/templates/template-kpis";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { BUSINESS_TYPE_LABELS } from "@/lib/business-modes";
import { prisma } from "@/lib/prisma";
import {
  WORKSPACE_TEMPLATE_REGISTRY,
  templatesForBusinessMode,
} from "@/lib/templates/template-registry";
import {
  ensureWorkspaceTemplates,
  getTemplateKpis,
  listApplications,
} from "@/services/templates/template-service";

export default async function TemplatesRecommendedPage() {
  const { sessionUser, dataUserId } = await getTenantActor();
  await ensureWorkspaceTemplates();

  const settings = await prisma.kitchenSettings.findUnique({
    where: { userId: dataUserId },
    select: { businessType: true },
  });
  const mode = settings?.businessType ?? null;
  const modeLabel = mode ? BUSINESS_TYPE_LABELS[mode] : null;
  const scope = { userId: dataUserId, email: sessionUser.email ?? null };

  const [kpis, history] = await Promise.all([
    getTemplateKpis(scope),
    listApplications(scope, 12),
  ]);

  const appliedKeys = new Set(
    history
      .filter((a) => a.status === "APPLIED" || a.status === "PARTIALLY_APPLIED")
      .map((a) => a.templateKey),
  );

  const recommended = mode ? templatesForBusinessMode(mode) : [];
  const top = recommended[0] ?? WORKSPACE_TEMPLATE_REGISTRY[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Quick-start Templates</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Start faster with safe, previewable workspace templates for restaurants,
            cafés, bars, bakeries, catering, meal prep, and ghost kitchens.
          </p>
          {modeLabel ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Highlighting templates for{" "}
              <span className="font-medium text-foreground">{modeLabel}</span>.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/templates/history">View applied templates</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/dashboard/templates/all">Choose template</Link>
          </Button>
        </div>
      </div>

      <TemplateKpis
        tiles={[
          { label: "Templates available", value: kpis.available },
          { label: "Applied templates", value: kpis.appliedCount },
          { label: "Pending previews", value: kpis.previewCount },
          {
            label: "Last applied",
            value: kpis.lastAppliedKey ?? "—",
            hint: kpis.lastAppliedAt ? kpis.lastAppliedAt.toLocaleDateString() : undefined,
          },
        ]}
      />

      {top ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recommended for {modeLabel ?? "your workspace"}
          </h2>
          <TemplateCard template={top} recommended applied={appliedKeys.has(top.key)} />
        </section>
      ) : null}

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            All starters
          </h2>
          <Link
            href="/dashboard/templates/all"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            See all →
          </Link>
        </div>
        {WORKSPACE_TEMPLATE_REGISTRY.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">No templates available</CardTitle>
              <CardDescription>
                System templates should be loaded. If none appear, check seed configuration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm">
                <Link href="/dashboard/templates">Reload templates</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {WORKSPACE_TEMPLATE_REGISTRY.map((t) => (
              <TemplateCard
                key={t.key}
                template={t}
                applied={appliedKeys.has(t.key)}
                recommended={t.key === top?.key}
              />
            ))}
          </div>
        )}
      </section>

      <Card className="border-border/80 bg-muted/10 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Related</CardTitle>
          <CardDescription>
            Templates configure modules and pinning. Use these neighbours for data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="premium" size="sm" className="rounded-full">
            <Link href="/demo">Demo hub</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/import-center">Import center</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/today">Today</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
