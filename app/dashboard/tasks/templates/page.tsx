import { applyBuiltInTemplateFormAction } from "@/actions/kitchen-task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { BUILT_IN_TASK_TEMPLATES } from "@/lib/tasks/task-templates";
import { TASK_PRIORITY_LABEL, TASK_TYPE_LABEL } from "@/lib/tasks/task-types";

export default async function TaskTemplatesPage() {
  const { userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    include: { kitchenSettings: { select: { businessType: true } } },
  });
  const mode = profile?.kitchenSettings?.businessType ?? null;

  const visible = BUILT_IN_TASK_TEMPLATES.filter(
    (t) => !t.businessModes || (mode && t.businessModes.includes(mode)),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Task templates</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          One-tap reusable task definitions for opening, closing, cleaning, prep, packing, catering and more.
          Applying a template creates a real task with the checklist pre-filled.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {visible.map((t) => (
          <Card key={t.slug} className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{t.title}</CardTitle>
                <Badge variant="outline" className="rounded-full">
                  {TASK_TYPE_LABEL[t.type]}
                </Badge>
              </div>
              <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                <Badge variant="secondary" className="rounded-full">
                  {TASK_PRIORITY_LABEL[t.priority]}
                </Badge>
                {t.assignedRole ? <Badge variant="outline" className="rounded-full">{t.assignedRole}</Badge> : null}
                {t.estimatedMinutes ? <span>{t.estimatedMinutes} min</span> : null}
                {t.recurrenceRule ? <span>· {t.recurrenceRule}</span> : null}
              </div>
              {t.checklist && t.checklist.length > 0 ? (
                <ul className="list-inside list-disc text-xs text-muted-foreground">
                  {t.checklist.map((c) => (
                    <li key={c.title}>{c.title}</li>
                  ))}
                </ul>
              ) : null}
              <form action={applyBuiltInTemplateFormAction} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="templateSlug" value={t.slug} />
                <div className="space-y-1">
                  <Label htmlFor={`due-${t.slug}`} className="text-xs">Due (optional)</Label>
                  <Input id={`due-${t.slug}`} name="dueAt" type="datetime-local" className="h-9" />
                </div>
                <Button type="submit" size="sm">Apply template</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
