import Link from "next/link";
import { notFound } from "next/navigation";

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
import { findTemplateByKey } from "@/lib/templates/template-registry";

type Params = { templateKey: string };

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const access = await requireTemplatesPageAccess("templates.view");
  if (!access.ok) return access.deny;
  const canApply = canUseTemplates(access.scope, "templates.apply");
  const { templateKey } = await params;
  const template = findTemplateByKey(templateKey);
  if (!template) notFound();

  const totalTasks = template.sections.setupTasks.length;
  const totalModules = template.sections.modulePins.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{template.title}</h1>
            <Badge variant="secondary" className="rounded-full text-xs">
              System
            </Badge>
            <Badge variant="outline" className="rounded-full text-xs">
              v{template.version}
            </Badge>
          </div>
          <p className="mt-1 max-w-3xl text-muted-foreground">{template.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {template.businessModes.map((m) => (
              <Badge key={m} variant="outline" className="rounded-full text-xs">
                {m}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canApply ? (
            <Button asChild>
              <Link href={`/dashboard/templates/${template.key}/apply`}>Apply…</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/dashboard/templates">Back</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Setup time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              ~{template.setupTimeMinutes} min
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Modules included
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{totalModules}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Setup tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{totalTasks}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">What it configures</CardTitle>
          <CardDescription>Read carefully before applying.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {template.whatItConfigures.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">What it does not do</CardTitle>
          <CardDescription>Safety boundaries.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {template.whatItDoesNot.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {template.warnings.length > 0 ? (
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {template.warnings.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Modules to pin</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {template.sections.modulePins.map((p) => (
                <li key={p.moduleKey} className="rounded-md border border-border/60 px-2 py-1">
                  {p.moduleKey}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Playbooks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {template.sections.playbookSlugs.map((s) => (
                <li key={s} className="rounded-md border border-border/60 px-2 py-1">
                  {s}
                </li>
              ))}
              {template.sections.playbookSlugs.length === 0 ? (
                <li className="text-muted-foreground">No playbooks seeded.</li>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Setup tasks</CardTitle>
          <CardDescription>
            These appear in the Tasks module after apply, tagged{" "}
            <code className="font-mono">IMPLEMENTATION</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            {template.sections.setupTasks.map((t) => (
              <li
                key={t.title}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 px-2 py-1"
              >
                <span>{t.title}</span>
                <span className="text-xs text-muted-foreground">
                  {t.priority ?? "MEDIUM"} · {t.actionRoute ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {template.sections.sampleMenuCategories?.length ? (
        <Card className="border-border/80 bg-muted/10 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Sample data (optional)</CardTitle>
            <CardDescription>
              The template does not write orders, customers, or invoices. Use the
              Demo Hub for sample data or the Import Center to upload your own.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Suggested menu categories:{" "}
              {template.sections.sampleMenuCategories.join(", ")}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
