import Link from "next/link";

import { createFullTaskFormAction } from "@/actions/kitchen-task";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { brandListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { BUILT_IN_TASK_TEMPLATES } from "@/lib/tasks/task-templates";
import {
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_VALUES,
  TASK_TYPE_LABEL,
  TASK_TYPE_VALUES,
  tasksTerminologyForMode,
} from "@/lib/tasks/task-types";

export default async function NewTaskPage() {
  const { userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    include: { kitchenSettings: { select: { businessType: true } } },
  });
  const mode = profile?.kitchenSettings?.businessType ?? null;
  const terminology = tasksTerminologyForMode(mode);
  const brandWhere = await brandListWhereForOwner(userId);
  const [staff, brands, locations] = await Promise.all([
    prisma.staffMember.findMany({ where: { userId, active: true }, orderBy: { name: "asc" } }),
    prisma.brand.findMany({
      where: brandWhere,
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.location.findMany({ where: { userId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">New task</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Full create form — covers assignee, role, priority, due date, estimated time, recurrence, tags, and templates.
          </p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/dashboard/tasks">Cancel</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
          <CardDescription>Required: title + type. Everything else is optional.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createFullTaskFormAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required maxLength={512} placeholder="e.g. Sunday prep — proteins" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskType">Type</Label>
              <select
                id="taskType"
                name="taskType"
                defaultValue={terminology.defaultType}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {TASK_TYPE_VALUES.map((t) => (
                  <option key={t} value={t}>{TASK_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                defaultValue="NORMAL"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {TASK_PRIORITY_VALUES.map((p) => (
                  <option key={p} value={p}>{TASK_PRIORITY_LABEL[p]}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedToId">Assignee</Label>
              <select
                id="assignedToId"
                name="assignedToId"
                defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Unassigned</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedRole">Role</Label>
              <Input id="assignedRole" name="assignedRole" placeholder="e.g. kitchen, packer, driver, manager" maxLength={64} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandId">Brand</Label>
              <select
                id="brandId"
                name="brandId"
                defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationId">Location</Label>
              <select
                id="locationId"
                name="locationId"
                defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueAt">Due</Label>
              <Input id="dueAt" name="dueAt" type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedMinutes">Estimated minutes</Label>
              <Input id="estimatedMinutes" name="estimatedMinutes" type="number" min={1} max={1440} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="recurrenceRule">Recurrence rule (optional)</Label>
              <Input id="recurrenceRule" name="recurrenceRule" placeholder="e.g. FREQ=DAILY  or  FREQ=WEEKLY;BYDAY=MO" maxLength={255} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" placeholder="Comma-separated: kitchen, prep, allergens" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="templateSlug">Apply built-in template (optional)</Label>
              <select
                id="templateSlug"
                name="templateSlug"
                defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No template</option>
                {BUILT_IN_TASK_TEMPLATES.map((t) => (
                  <option key={t.slug} value={t.slug}>{t.title}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Templates fill in the checklist, default role, and estimated time.</p>
            </div>

            <div className="md:col-span-2">
              <Button type="submit" className="rounded-full">Create task</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
