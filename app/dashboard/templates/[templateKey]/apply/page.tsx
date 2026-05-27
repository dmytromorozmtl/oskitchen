import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplyWizard } from "@/components/dashboard/templates/apply-wizard";
import { Button } from "@/components/ui/button";
import { findTemplateByKey } from "@/lib/templates/template-registry";
import { buildTemplatePreview } from "@/lib/templates/template-preview";
import { requireTemplatesPageAccess } from "@/lib/templates/template-page-access";
import { ALL_TEMPLATE_SECTIONS } from "@/lib/templates/template-types";
import { prisma } from "@/lib/prisma";

type Params = { templateKey: string };

export default async function ApplyTemplatePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const access = await requireTemplatesPageAccess("templates.apply");
  if (!access.ok) return access.deny;

  const { templateKey } = await params;
  const template = findTemplateByKey(templateKey);
  if (!template) notFound();

  const dataUserId = access.tenantScope.userId;

  const [settings, pins, playbooks] = await Promise.all([
    prisma.kitchenSettings.findUnique({
      where: { userId: dataUserId },
      select: { businessType: true },
    }),
    prisma.kitchenModulePreference.findMany({
      where: { userId: dataUserId, pinned: true },
      select: { moduleKey: true },
    }),
    prisma.playbook.findMany({
      where: { userId: dataUserId, systemTemplate: true },
      select: { slug: true },
    }),
  ]);

  const preview = buildTemplatePreview(
    template,
    {
      currentBusinessMode: settings?.businessType ?? null,
      existingPinnedModuleKeys: pins.map((p) => p.moduleKey),
      existingPlaybookSlugs: playbooks.map((p) => p.slug ?? "").filter(Boolean),
    },
    ALL_TEMPLATE_SECTIONS,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Apply: {template.title}
          </h1>
          <p className="text-muted-foreground">
            Preview every change, resolve conflicts, then confirm — nothing
            writes until you click Apply.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/templates/${template.key}`}>Back to template</Link>
        </Button>
      </div>
      <ApplyWizard template={template} preview={preview} />
    </div>
  );
}
