import { ImportRollbackRecordStatus, ImportStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  exportJobListWhereForOwner,
  importJobListWhereForOwner,
} from "@/lib/scope/workspace-import-export-scope";
function startOfUtcMonth(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

export type DataOperationsOverview = {
  importsThisMonth: number;
  exportsThisMonth: number;
  pendingValidation: number;
  rowsImportedThisMonth: number;
  rowsWithErrorsThisMonth: number;
  lastExportLabel: string | null;
  rollbackEligibleJobs: number;
};

export async function loadDataOperationsOverview(userId: string): Promise<DataOperationsOverview> {
  const start = startOfUtcMonth();
  const importScope = await importJobListWhereForOwner(userId);
  const exportScope = await exportJobListWhereForOwner(userId);

  const [
    importsThisMonth,
    exportsThisMonth,
    pendingValidation,
    importedAgg,
    errorAgg,
    lastExport,
    rollbackEligibleJobs,
  ] = await Promise.all([
    prisma.importJob.count({ where: { AND: [importScope, { createdAt: { gte: start } }] } }),
    prisma.exportJob.count({ where: { AND: [exportScope, { createdAt: { gte: start } }] } }),
    prisma.importJob.count({
      where: {
        AND: [
          importScope,
          { status: { in: [ImportStatus.UPLOADED, ImportStatus.MAPPING, ImportStatus.VALIDATED] } },
        ],
      },
    }),
    prisma.importJob.aggregate({
      where: { AND: [importScope, { status: ImportStatus.IMPORTED, createdAt: { gte: start } }] },
      _sum: { createdRows: true },
    }),
    prisma.importJob.aggregate({
      where: { AND: [importScope, { createdAt: { gte: start } }] },
      _sum: { errorRows: true },
    }),
    prisma.exportJob.findFirst({
      where: exportScope,
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, type: true, rowCount: true },
    }),
    prisma.importJob.count({
      where: {
        AND: [
          importScope,
          {
            status: ImportStatus.IMPORTED,
            rollbacks: { none: { status: ImportRollbackRecordStatus.COMPLETED } },
          },
        ],
      },
    }),
  ]);

  const lastExportLabel = lastExport
    ? `${lastExport.type} · ${lastExport.rowCount} rows · ${lastExport.createdAt.toISOString().slice(0, 10)}`
    : null;

  return {
    importsThisMonth,
    exportsThisMonth,
    pendingValidation,
    rowsImportedThisMonth: importedAgg._sum.createdRows ?? 0,
    rowsWithErrorsThisMonth: errorAgg._sum.errorRows ?? 0,
    lastExportLabel,
    rollbackEligibleJobs,
  };
}
