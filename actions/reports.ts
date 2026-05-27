"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import { isReportKey } from "@/lib/reports/report-registry";
import { requireReportExportActor } from "@/lib/reports/report-export-access";
import { requireReportReadActor } from "@/lib/reports/require-report-read-actor";
import {
  parseReportFilters,
  serialiseReportFilters,
} from "@/lib/reports/report-filters";
import { recordReportExport, runReport, buildReportCsv } from "@/services/reports/report-service";

const REPORTS_PATH = "/dashboard/reports";

function actorScopeFromUser(actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>) {
  return createReportActorScope(actor);
}

const saveSchema = z.object({
  reportKey: z.string().min(1),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional().or(z.literal("")),
  filters: z.record(z.union([z.string(), z.array(z.string())])).optional(),
  pinned: z.boolean().optional(),
});

export async function saveReportAction(input: z.infer<typeof saveSchema>) {
  const actor = await requireWorkspacePermissionActor();
  const { userId } = actor;
  const access = await requireReportReadActor("reports.saved.manage", {
    operation: "reports.saved.create",
    reportKey: input.reportKey,
  });
  if (!access.ok) {
    throw new Error(access.error);
  }
  const parsed = saveSchema.parse(input);
  if (!isReportKey(parsed.reportKey)) throw new Error("Unknown report");
  const filters = parsed.filters ?? {};
  const existing = await prisma.savedReport.findUnique({
    where: { userId_name: { userId, name: parsed.name } },
  });
  if (existing) {
    await prisma.savedReport.update({
      where: { id: existing.id },
      data: {
        reportKey: parsed.reportKey,
        description: parsed.description || null,
        filtersJson: filters,
        pinned: parsed.pinned ?? existing.pinned,
      },
    });
  } else {
    await prisma.savedReport.create({
      data: {
        userId,
        reportKey: parsed.reportKey,
        name: parsed.name,
        description: parsed.description || null,
        filtersJson: filters,
        pinned: parsed.pinned ?? false,
      },
    });
  }
  revalidatePath(REPORTS_PATH);
  revalidatePath(`${REPORTS_PATH}/saved`);
}

export async function deleteSavedReportAction(savedReportId: string) {
  const actor = await requireWorkspacePermissionActor();
  const { userId } = actor;
  const access = await requireReportReadActor("reports.saved.manage", {
    operation: "reports.saved.delete",
  });
  if (!access.ok) {
    throw new Error(access.error);
  }
  await prisma.savedReport.deleteMany({ where: { id: savedReportId, userId } });
  revalidatePath(`${REPORTS_PATH}/saved`);
}

export async function duplicateSavedReportAction(savedReportId: string) {
  const actor = await requireWorkspacePermissionActor();
  const { userId } = actor;
  const access = await requireReportReadActor("reports.saved.manage", {
    operation: "reports.saved.duplicate",
  });
  if (!access.ok) {
    throw new Error(access.error);
  }
  const source = await prisma.savedReport.findFirst({
    where: { id: savedReportId, userId },
  });
  if (!source) return;
  let name = `${source.name} (copy)`;
  let suffix = 2;
  while (
    await prisma.savedReport.findUnique({
      where: { userId_name: { userId, name } },
    })
  ) {
    name = `${source.name} (copy ${suffix++})`;
  }
  await prisma.savedReport.create({
    data: {
      userId,
      reportKey: source.reportKey,
      name,
      description: source.description,
      filtersJson: source.filtersJson ?? undefined,
      columnsJson: source.columnsJson ?? undefined,
      pinned: false,
    },
  });
  revalidatePath(`${REPORTS_PATH}/saved`);
}

export async function toggleSavedReportPinAction(savedReportId: string) {
  const actor = await requireWorkspacePermissionActor();
  const { userId } = actor;
  const access = await requireReportReadActor("reports.saved.manage", {
    operation: "reports.saved.toggle_pin",
  });
  if (!access.ok) {
    throw new Error(access.error);
  }
  const sr = await prisma.savedReport.findFirst({
    where: { id: savedReportId, userId },
    select: { pinned: true },
  });
  if (!sr) return;
  await prisma.savedReport.update({
    where: { id: savedReportId },
    data: { pinned: !sr.pinned },
  });
  revalidatePath(REPORTS_PATH);
  revalidatePath(`${REPORTS_PATH}/saved`);
}

export type ServerActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function saveReportFormAction(formData: FormData): Promise<ServerActionResult> {
  try {
    const reportKey = String(formData.get("reportKey") ?? "");
    const name = String(formData.get("name") ?? "");
    const description = String(formData.get("description") ?? "");
    const filtersQuery = String(formData.get("filtersQuery") ?? "");
    const filters = Object.fromEntries(new URLSearchParams(filtersQuery));
    await saveReportAction({ reportKey, name, description, filters });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to save report" };
  }
}

export async function exportReportCsvAction(args: {
  reportKey: string;
  filtersQuery: string;
}): Promise<ServerActionResult<{ filename: string; body: string }>> {
  try {
    const access = await requireReportExportActor({ reportKey: args.reportKey });
    if (!access.ok) {
      return { ok: false, error: "Forbidden" };
    }
    const actor = access.actor;
    const { userId } = actor;
    const scope = actorScopeFromUser(actor);
    if (!isReportKey(args.reportKey)) {
      return { ok: false, error: "Unknown report" };
    }
    const filters = parseReportFilters(Object.fromEntries(new URLSearchParams(args.filtersQuery)));
    const result = await runReport(args.reportKey, {
      userId,
      scope,
      filters,
    });
    if (result.status !== "ok") {
      return { ok: false, error: result.warnings[0] ?? "Unable to run report" };
    }
    const csv = buildReportCsv(result);
    await recordReportExport({
      userId,
      reportKey: args.reportKey,
      filename: csv.filename,
      rowCount: csv.rowCount,
      filtersJson: Object.fromEntries(serialiseReportFilters(filters)),
    });
    return { ok: true, data: { filename: csv.filename, body: csv.body } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to export report" };
  }
}
