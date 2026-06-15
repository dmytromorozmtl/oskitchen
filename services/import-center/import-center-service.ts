import { randomUUID } from "crypto";

import type {
  ImportCommitMode,
  ImportPreviewRowAction,
  ImportPreviewRowStatus,
  ImportType,
  Prisma,
} from "@prisma/client";

import { csvEscapeCell } from "@/lib/import-export/csv-format";
import { parseCsv } from "@/lib/import-center/csv-parser";
import { suggestImportMapping } from "@/lib/import-center/column-mapping";
import { dedupeKey, type ExistingMatchLookup } from "@/lib/import-center/duplicate-detection";
import { buildImportPreview } from "@/lib/import-center/import-preview";
import {
  commitNotSupportedReason,
  isCommittableType,
} from "@/lib/import-center/import-commit";
import {
  buildRollbackPlan,
  parseRollbackPlan,
  rollbackAvailability,
  rollbackEntityLabel,
  type RollbackEntityKind,
} from "@/lib/import-center/import-rollback";
import {
  EMPTY_PREVIEW_SUMMARY,
  type CommitOutcome,
  type ImportRowView,
  type PreviewSummary,
} from "@/lib/import-center/import-types";
import {
  MAX_IMPORT_BYTES,
  MAX_IMPORT_ROWS,
  MAX_PREVIEW_ROWS_PERSISTED,
} from "@/lib/import-export/limits";
import { ensureCatalogMenu } from "@/lib/products/ensure-catalog-menu";
import {
  importJobByIdWhereForOwner,
  importJobListWhereForOwner,
} from "@/lib/scope/workspace-import-export-scope";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { prisma } from "@/lib/prisma";
import {
  kitchenCustomerByIdWhereForOwner,
  kitchenCustomerListWhereForOwner,
} from "@/lib/scope/workspace-customer-scope";
import {
  ingredientListWhereForOwner,
  menuListWhereForOwner,
  menuListWhereForOwnerAnd,
  productByIdWhereForOwner,
  productListWhereForOwner,
  staffMemberListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { auditLog } from "@/services/audit/audit-service";

export type UploadInput = {
  userId: string;
  performedById?: string | null;
  type: ImportType;
  filename: string;
  csvText: string;
  commitMode: ImportCommitMode;
  mappingOverride?: Record<string, string>;
};

export type UploadOutcome =
  | { ok: true; importJobId: string; summary: PreviewSummary }
  | { ok: false; error: string };

async function loadExistingMatches(
  userId: string,
  type: ImportType,
): Promise<ExistingMatchLookup> {
  const matches = new Map<string, string>();
  if (type === "CUSTOMERS") {
    const rows = await prisma.kitchenCustomer.findMany({
      where: await kitchenCustomerListWhereForOwner(userId),
      select: { id: true, email: true, phone: true },
    });
    for (const r of rows) {
      if (r.email) matches.set(`email:${r.email.toLowerCase()}`, r.id);
      if (r.phone) matches.set(`phone:${r.phone.replace(/[^\d+]/g, "")}`, r.id);
    }
  } else if (type === "STAFF") {
    const rows = await prisma.staffMember.findMany({
      where: await staffMemberListWhereForOwner(userId),
      select: { id: true, email: true, name: true },
    });
    for (const r of rows) {
      if (r.email) matches.set(`staff_email:${r.email.toLowerCase()}`, r.id);
      if (r.name) matches.set(`staff_name:${r.name.toLowerCase().trim()}`, r.id);
    }
  } else if (type === "INGREDIENTS") {
    const rows = await prisma.ingredient.findMany({
      where: await ingredientListWhereForOwner(userId),
      select: { id: true, name: true, unit: true },
    });
    for (const r of rows) {
      matches.set(`ingredient:${r.name.toLowerCase().trim()}|${r.unit.toLowerCase().trim()}`, r.id);
    }
  } else if (type === "PRODUCTS") {
    const rows = await prisma.product.findMany({
      where: await productListWhereForOwner(userId),
      select: { id: true, title: true },
    });
    for (const r of rows) {
      if (r.title) matches.set(`title:${r.title.toLowerCase().trim()}`, r.id);
    }
  }
  return { matches };
}

export async function uploadImportCsv(input: UploadInput): Promise<UploadOutcome> {
  const bytes = Buffer.byteLength(input.csvText, "utf8");
  if (bytes > MAX_IMPORT_BYTES) {
    return { ok: false, error: `File exceeds ${MAX_IMPORT_BYTES.toLocaleString()} byte limit.` };
  }

  let parsed;
  try {
    parsed = parseCsv(input.csvText, MAX_IMPORT_ROWS);
  } catch {
    return { ok: false, error: "Could not parse CSV." };
  }
  if (parsed.headers.length === 0) {
    return { ok: false, error: "CSV has no header row." };
  }

  const mapping = input.mappingOverride ?? suggestImportMapping(input.type, parsed.headers);
  const existing = await loadExistingMatches(input.userId, input.type);
  const preview = buildImportPreview({
    type: input.type,
    headers: parsed.headers,
    rows: parsed.rows,
    mappingOverride: mapping,
    commitMode: input.commitMode,
    existing,
  });

  try {
    const workspaceId = await resolveOwnerWorkspaceId(input.userId);
    const jobId = await prisma.$transaction(async (tx) => {
      const job = await tx.importJob.create({
        data: {
          userId: input.userId,
          workspaceId: workspaceId ?? undefined,
          type: input.type,
          filename: input.filename.slice(0, 512),
          status: preview.unresolvedRequiredColumns.length > 0 ? "MAPPING" : "VALIDATED",
          totalRows: preview.summary.totalRows,
          validRows: preview.summary.validRows,
          warningRows: preview.summary.warningRows,
          errorRows: preview.summary.errorRows,
          duplicateRows: preview.summary.duplicateRows,
          skippedRows: preview.summary.skippedRows,
          createdRows: preview.summary.createCount,
          updatedRows: preview.summary.updateCount,
          rejectedRows: preview.summary.rejectCount,
          fileSize: bytes,
          mappingJson: mapping as Prisma.InputJsonValue,
          commitMode: input.commitMode,
          previewJson: preview.summary as unknown as Prisma.InputJsonValue,
          resultJson: undefined,
          settingsJson: {
            unresolvedRequiredColumns: preview.unresolvedRequiredColumns,
            headers: parsed.headers,
          } as Prisma.InputJsonValue,
          createdById: input.performedById ?? undefined,
          validatedAt: preview.unresolvedRequiredColumns.length === 0 ? new Date() : null,
        },
      });

      const slice = preview.rows.slice(0, MAX_PREVIEW_ROWS_PERSISTED);
      if (slice.length > 0) {
        await tx.importJobPreviewRow.createMany({
          data: slice.map((r) => ({
            id: randomUUID(),
            importJobId: job.id,
            rowNumber: r.rowNumber,
            rawJson: r.raw as Prisma.InputJsonValue,
            normalizedJson:
              r.normalized != null ? (r.normalized as Prisma.InputJsonValue) : undefined,
            validationStatus: r.validationStatus,
            errorsJson: r.errors.length ? (r.errors as unknown as Prisma.InputJsonValue) : undefined,
            warningsJson: r.warnings.length
              ? (r.warnings as unknown as Prisma.InputJsonValue)
              : undefined,
            action: r.action,
            targetEntityId: r.targetEntityId ?? undefined,
            duplicateOfId: r.duplicateOfId ?? undefined,
          })),
        });
      }
      return job.id;
    });

    return { ok: true, importJobId: jobId, summary: preview.summary };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return { ok: false, error: message };
  }
}

export type ImportJobView = {
  id: string;
  type: ImportType;
  filename: string;
  status: string;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  duplicateRows: number;
  skippedRows: number;
  createdRows: number;
  updatedRows: number;
  rejectedRows: number;
  fileSize: number;
  mapping: Record<string, string> | null;
  commitMode: ImportCommitMode | null;
  previewSummary: PreviewSummary;
  resultSummary: CommitOutcome | null;
  errorMessage: string | null;
  createdAt: Date;
  validatedAt: Date | null;
  committedAt: Date | null;
  rolledBackAt: Date | null;
  completedAt: Date | null;
  createdByLabel: string | null;
};

export async function getImportJob(userId: string, jobId: string): Promise<{
  job: ImportJobView;
  rows: ImportRowView[];
  rollbacks: { id: string; status: string; recordsRolledBack: number; createdAt: Date }[];
} | null> {
  const job = await prisma.importJob.findFirst({
    where: await importJobByIdWhereForOwner(userId, jobId),
    include: {
      previewRows: { orderBy: { rowNumber: "asc" }, take: 500 },
      createdBy: { select: { email: true, fullName: true } },
      rollbacks: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!job) return null;

  const view: ImportJobView = {
    id: job.id,
    type: job.type,
    filename: job.filename,
    status: job.status,
    totalRows: job.totalRows,
    validRows: job.validRows,
    warningRows: job.warningRows,
    errorRows: job.errorRows,
    duplicateRows: job.duplicateRows,
    skippedRows: job.skippedRows,
    createdRows: job.createdRows,
    updatedRows: job.updatedRows,
    rejectedRows: job.rejectedRows,
    fileSize: job.fileSize,
    mapping: (job.mappingJson as Record<string, string> | null) ?? null,
    commitMode: job.commitMode,
    previewSummary: (job.previewJson as PreviewSummary | null) ?? { ...EMPTY_PREVIEW_SUMMARY, totalRows: job.totalRows },
    resultSummary: (job.resultJson as CommitOutcome | null) ?? null,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt,
    validatedAt: job.validatedAt,
    committedAt: job.committedAt,
    rolledBackAt: job.rolledBackAt,
    completedAt: job.completedAt,
    createdByLabel: job.createdBy?.fullName ?? job.createdBy?.email ?? null,
  };

  const rows: ImportRowView[] = job.previewRows.map((r) => ({
    id: r.id,
    rowNumber: r.rowNumber,
    raw: r.rawJson as Record<string, string>,
    normalized: (r.normalizedJson as Record<string, unknown> | null) ?? null,
    validationStatus: r.validationStatus,
    action: r.action,
    errors: (r.errorsJson as { code: string; message: string }[] | null) ?? [],
    warnings: (r.warningsJson as { code: string; message: string }[] | null) ?? [],
    duplicateOfId: r.duplicateOfId,
    targetEntityId: r.targetEntityId,
  }));

  return {
    job: view,
    rows,
    rollbacks: job.rollbacks.map((rb) => ({
      id: rb.id,
      status: rb.status,
      recordsRolledBack: rb.recordsRolledBack,
      createdAt: rb.createdAt,
    })),
  };
}

export async function listImportJobs(userId: string, take = 60) {
  return prisma.importJob.findMany({
    where: await importJobListWhereForOwner(userId),
    orderBy: { createdAt: "desc" },
    take,
    include: {
      createdBy: { select: { email: true, fullName: true } },
      rollbacks: { select: { id: true, status: true, createdAt: true } },
    },
  });
}

export async function importCenterKpis(userId: string): Promise<{
  importsThisMonth: number;
  pendingValidation: number;
  readyToCommit: number;
  rowsImportedThisMonth: number;
  rowsWithErrorsThisMonth: number;
  rollbackEligibleJobs: number;
}> {
  const start = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 0, 0, 0));
  const jobWhere = await importJobListWhereForOwner(userId);
  const [importsThisMonth, pendingValidation, readyToCommit, createdAgg, errorAgg, rollbackEligible] =
    await Promise.all([
      prisma.importJob.count({ where: { AND: [jobWhere, { createdAt: { gte: start } }] } }),
      prisma.importJob.count({
        where: { AND: [jobWhere, { status: { in: ["UPLOADED", "MAPPING"] } }] },
      }),
      prisma.importJob.count({ where: { AND: [jobWhere, { status: "VALIDATED" }] } }),
      prisma.importJob.aggregate({
        where: { AND: [jobWhere, { status: "IMPORTED", createdAt: { gte: start } }] },
        _sum: { createdRows: true, updatedRows: true },
      }),
      prisma.importJob.aggregate({
        where: { AND: [jobWhere, { createdAt: { gte: start } }] },
        _sum: { errorRows: true },
      }),
      prisma.importJob.count({
        where: {
          AND: [
            jobWhere,
            {
              status: "IMPORTED",
              rollbacks: { none: { status: "COMPLETED" } },
            },
          ],
        },
      }),
    ]);
  return {
    importsThisMonth,
    pendingValidation,
    readyToCommit,
    rowsImportedThisMonth: (createdAgg._sum.createdRows ?? 0) + (createdAgg._sum.updatedRows ?? 0),
    rowsWithErrorsThisMonth: errorAgg._sum.errorRows ?? 0,
    rollbackEligibleJobs: rollbackEligible,
  };
}

export type CommitInput = {
  userId: string;
  performedById?: string | null;
  jobId: string;
  includeWarnings: boolean;
};

export type CommitResult =
  | { ok: true; outcome: CommitOutcome }
  | { ok: false; error: string };

export async function commitImportJob(input: CommitInput): Promise<CommitResult> {
  const jobWhere = await importJobByIdWhereForOwner(input.userId, input.jobId);
  const [job, previewRows] = await Promise.all([
    prisma.importJob.findFirst({ where: jobWhere }),
    prisma.importJobPreviewRow.findMany({
      where: { importJobId: input.jobId },
      orderBy: { rowNumber: "asc" },
    }),
  ]);
  if (!job) return { ok: false, error: "Import job not found." };
  if (job.status === "IMPORTED") return { ok: false, error: "Import job already committed." };
  if (job.status !== "VALIDATED") {
    return { ok: false, error: `Import job must be in VALIDATED state to commit (currently ${job.status}).` };
  }
  if (!isCommittableType(job.type)) {
    return { ok: false, error: commitNotSupportedReason(job.type) };
  }

  const eligibleStatuses: ImportPreviewRowStatus[] = input.includeWarnings
    ? ["VALID", "WARNING"]
    : ["VALID"];
  const eligibleActions: ImportPreviewRowAction[] = ["CREATE", "UPDATE"];
  const eligible = previewRows.filter(
    (r) =>
      eligibleStatuses.includes(r.validationStatus) && eligibleActions.includes(r.action),
  );

  const outcome: CommitOutcome = {
    created: 0,
    updated: 0,
    skipped: previewRows.length - eligible.length,
    rejected: previewRows.filter((r) => r.validationStatus === "ERROR").length,
    warnings: previewRows.filter((r) => r.validationStatus === "WARNING").length,
    notes: [],
  };
  const createdEntities: { entity: RollbackEntityKind; id: string }[] = [];
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);

  let productsTargetMenu: { id: string } | null = null;
  if (job.type === "PRODUCTS") {
    await ensureCatalogMenu(input.userId);
    const [activeMenuWhere, catalogMenuWhere] = await Promise.all([
      menuListWhereForOwnerAnd(input.userId, { active: true, catalogOnly: false }),
      menuListWhereForOwnerAnd(input.userId, { catalogOnly: true }),
    ]);
    const [activeMenu, catalogMenu] = await Promise.all([
      prisma.menu.findFirst({
        where: activeMenuWhere,
        orderBy: { createdAt: "desc" },
        select: { id: true },
      }),
      prisma.menu.findFirst({
        where: catalogMenuWhere,
        select: { id: true },
      }),
    ]);
    productsTargetMenu = activeMenu ?? catalogMenu;
  }

  try {
    for (const row of eligible) {
      const normalized = row.normalizedJson as Record<string, unknown> | null;
      if (!normalized) {
        outcome.skipped += 1;
        continue;
      }

      if (job.type === "CUSTOMERS") {
        const data = normalized as { email: string; name: string | null; phone: string | null; notes: string | null };
        const existing = await prisma.kitchenCustomer.findUnique({
          where: { userId_email: { userId: input.userId, email: data.email } },
        });
        if (existing) {
          if (row.action === "UPDATE") {
            await prisma.kitchenCustomer.update({
              where: { id: existing.id },
              data: {
                name: data.name ?? undefined,
                phone: data.phone ?? undefined,
                notes: data.notes ?? undefined,
              },
            });
            outcome.updated += 1;
          } else {
            outcome.skipped += 1;
          }
        } else {
          const created = await prisma.kitchenCustomer.create({
            data: {
              userId: input.userId,
              workspaceId,
              email: data.email,
              name: data.name,
              phone: data.phone,
              notes: data.notes,
              source: "IMPORT",
            },
          });
          createdEntities.push({ entity: "kitchenCustomer", id: created.id });
          outcome.created += 1;
        }
      } else if (job.type === "STAFF") {
        const data = normalized as { name: string; email: string | null; role: string };
        if (data.email) {
          const existing = await prisma.staffMember.findFirst({
            where: { userId: input.userId, email: data.email },
          });
          if (existing) {
            if (row.action === "UPDATE") {
              await prisma.staffMember.update({
                where: { id: existing.id },
                data: { name: data.name, role: data.role || "staff" },
              });
              outcome.updated += 1;
            } else {
              outcome.skipped += 1;
            }
            continue;
          }
        }
        const created = await prisma.staffMember.create({
          data: { userId: input.userId, name: data.name, email: data.email, role: data.role || "staff" },
        });
        createdEntities.push({ entity: "staffMember", id: created.id });
        outcome.created += 1;
      } else if (job.type === "INGREDIENTS") {
        const data = normalized as {
          name: string;
          unit: string;
          costPerUnit: string;
          currentStock: string;
          parLevel: string;
          supplier: string | null;
        };
        if (row.action === "UPDATE" && row.targetEntityId) {
          await prisma.ingredient.update({
            where: { id: row.targetEntityId },
            data: {
              costPerUnit: data.costPerUnit,
              currentStock: data.currentStock,
              parLevel: data.parLevel,
              supplier: data.supplier ?? undefined,
            },
          });
          outcome.updated += 1;
        } else {
          const created = await prisma.ingredient.create({
            data: {
              userId: input.userId,
              name: data.name,
              unit: data.unit,
              costPerUnit: data.costPerUnit,
              currentStock: data.currentStock,
              parLevel: data.parLevel,
              supplier: data.supplier ?? null,
            },
          });
          createdEntities.push({ entity: "ingredient", id: created.id });
          outcome.created += 1;
        }
      } else if (job.type === "PRODUCTS") {
        const targetMenu = productsTargetMenu;
        if (!targetMenu) {
          outcome.notes.push(`Row ${row.rowNumber}: no menu available`);
          outcome.skipped += 1;
          continue;
        }
        const data = normalized as {
          title: string;
          sku: string | null;
          price: string;
          preparedDate: string;
          pickupDate: string | null;
          description: string | null;
          allergens: string | null;
        };
        if (row.action === "UPDATE" && row.targetEntityId) {
          const owned = await prisma.product.findFirst({
            where: await productByIdWhereForOwner(input.userId, row.targetEntityId),
            select: { id: true },
          });
          if (!owned) {
            outcome.notes.push(`Row ${row.rowNumber}: product not found`);
            outcome.skipped += 1;
            continue;
          }
          await prisma.product.update({
            where: { id: owned.id },
            data: {
              title: data.title,
              price: data.price,
              preparedDate: new Date(data.preparedDate),
              pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
              description: data.description ?? undefined,
              allergens: data.allergens ?? undefined,
            },
          });
          outcome.updated += 1;
        } else {
          const created = await prisma.product.create({
            data: {
              menuId: targetMenu.id,
              workspaceId: workspaceId ?? undefined,
              title: data.title,
              price: data.price,
              preparedDate: new Date(data.preparedDate),
              pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
              description: data.description ?? null,
              allergens: data.allergens ?? null,
              active: true,
              productionTask: { create: {} },
            },
            include: { productionTask: { select: { id: true } } },
          });
          createdEntities.push({ entity: "product", id: created.id });
          if (created.productionTask) {
            createdEntities.push({ entity: "productionTask", id: created.productionTask.id });
          }
          outcome.created += 1;
        }
      } else {
        return { ok: false, error: commitNotSupportedReason(job.type) };
      }

      await prisma.importJobPreviewRow.update({
        where: { id: row.id },
        data: { importedAt: new Date() },
      });
    }

    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: "IMPORTED",
        createdRows: outcome.created,
        updatedRows: outcome.updated,
        skippedRows: outcome.skipped,
        rejectedRows: outcome.rejected,
        resultJson: outcome as unknown as Prisma.InputJsonValue,
        rollbackJson: buildRollbackPlan(job.type, createdEntities) as unknown as Prisma.InputJsonValue,
        committedAt: new Date(),
        completedAt: new Date(),
      },
    });

    void auditLog({
      actor: { userId: input.performedById ?? input.userId },
      action: "IMPORT_COMMITTED",
      category: "IMPORT_EXPORT",
      source: "IMPORT",
      severity: "NOTICE",
      entity: { type: "ImportJob", id: job.id, label: job.type },
      metadata: {
        created: outcome.created,
        updated: outcome.updated,
        skipped: outcome.skipped,
        rejected: outcome.rejected,
      },
    });

    return { ok: true, outcome };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Commit failed.";
    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        errorMessage: message,
        resultJson: outcome as unknown as Prisma.InputJsonValue,
        rollbackJson:
          createdEntities.length > 0
            ? (buildRollbackPlan(job.type, createdEntities) as unknown as Prisma.InputJsonValue)
            : undefined,
      },
    });
    return { ok: false, error: message };
  }
}

export type RollbackInput = {
  userId: string;
  performedById?: string | null;
  jobId: string;
  reason: string;
};

export type RollbackResult =
  | { ok: true; recordsRolledBack: number }
  | { ok: false; error: string };

export async function rollbackImportJob(input: RollbackInput): Promise<RollbackResult> {
  const job = await prisma.importJob.findFirst({
    where: await importJobByIdWhereForOwner(input.userId, input.jobId),
  });
  if (!job) return { ok: false, error: "Import job not found." };
  if (job.status !== "IMPORTED") {
    return { ok: false, error: "Only imported jobs can be rolled back." };
  }
  const plan = parseRollbackPlan(job.rollbackJson);
  const availability = rollbackAvailability(plan, job.rolledBackAt !== null);
  if (!availability.available) return { ok: false, error: availability.reason };

  if (!plan) return { ok: false, error: "Rollback plan missing." };

  let removed = 0;
  const notes: string[] = [];
  try {
    for (const entity of plan.createdEntities) {
      try {
        let deleted = 0;
        if (entity.entity === "kitchenCustomer") {
          const r = await prisma.kitchenCustomer.deleteMany({
            where: await kitchenCustomerByIdWhereForOwner(input.userId, entity.id),
          });
          deleted = r.count;
        } else if (entity.entity === "staffMember") {
          const r = await prisma.staffMember.deleteMany({
            where: { id: entity.id, userId: input.userId },
          });
          deleted = r.count;
        } else if (entity.entity === "ingredient") {
          const r = await prisma.ingredient.deleteMany({
            where: { id: entity.id, userId: input.userId },
          });
          deleted = r.count;
        } else if (entity.entity === "productionTask") {
          const menuScope = await menuListWhereForOwner(input.userId);
          const r = await prisma.productionTask.deleteMany({
            where: {
              id: entity.id,
              product: { menu: menuScope },
            },
          });
          deleted = r.count;
        } else if (entity.entity === "product") {
          const r = await prisma.product.deleteMany({
            where: await productByIdWhereForOwner(input.userId, entity.id),
          });
          deleted = r.count;
        } else {
          notes.push(`Unknown entity kind ${entity.entity}`);
          continue;
        }
        if (deleted === 0) {
          notes.push(
            `${rollbackEntityLabel(entity.entity)} ${entity.id}: no row deleted (tenant scope or already removed)`,
          );
          continue;
        }
        removed += deleted;
      } catch (error) {
        const message = error instanceof Error ? error.message : "delete failed";
        notes.push(`${rollbackEntityLabel(entity.entity)} ${entity.id}: ${message}`);
      }
    }

    await prisma.$transaction([
      prisma.importRollback.create({
        data: {
          importJobId: job.id,
          performedById: input.performedById ?? undefined,
          reason: input.reason,
          recordsRolledBack: removed,
          status: removed === plan.createdEntities.length ? "COMPLETED" : "FAILED",
        },
      }),
      prisma.importJob.update({
        where: { id: job.id },
        data: {
          rolledBackAt: new Date(),
          resultJson: {
            ...(job.resultJson as object),
            rollbackNotes: notes,
            rolledBack: removed,
          } as unknown as Prisma.InputJsonValue,
        },
      }),
    ]);

    return { ok: true, recordsRolledBack: removed };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rollback failed.";
    return { ok: false, error: message };
  }
}

export async function cancelImportJob(userId: string, jobId: string, reason: string | null) {
  const job = await prisma.importJob.findFirst({
    where: await importJobByIdWhereForOwner(userId, jobId),
  });
  if (!job) return { ok: false as const, error: "Import job not found." };
  if (job.status === "IMPORTED") return { ok: false as const, error: "Cannot cancel a committed job." };
  await prisma.importJob.update({
    where: { id: job.id },
    data: {
      status: "CANCELLED",
      errorMessage: reason ?? "Cancelled by user",
      completedAt: new Date(),
    },
  });
  return { ok: true as const };
}

export function buildErrorCsv(rows: ImportRowView[]): string {
  const header = ["row_number", "error_codes", "error_messages", "warnings", "raw_row"];
  const lines = [header.map(csvEscapeCell).join(",")];
  for (const row of rows) {
    if (row.validationStatus !== "ERROR" && row.validationStatus !== "WARNING") continue;
    lines.push(
      [
        csvEscapeCell(String(row.rowNumber)),
        csvEscapeCell(row.errors.map((e) => e.code).join("; ")),
        csvEscapeCell(row.errors.map((e) => e.message).join("; ")),
        csvEscapeCell(row.warnings.map((w) => w.message).join("; ")),
        csvEscapeCell(JSON.stringify(row.raw)),
      ].join(","),
    );
  }
  return lines.join("\n");
}

export function dedupeKeyFor(type: ImportType, normalized: Record<string, unknown> | null): string | null {
  return dedupeKey(type, normalized);
}
