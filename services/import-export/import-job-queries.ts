import { ImportPreviewRowStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  exportJobListWhereForOwner,
  importJobByIdWhereForOwner,
  importJobListWhereForOwner,
} from "@/lib/scope/workspace-import-export-scope";

export async function getImportJobForUser(userId: string, jobId: string) {
  return prisma.importJob.findFirst({
    where: await importJobByIdWhereForOwner(userId, jobId),
    include: {
      previewRows: { orderBy: { rowNumber: "asc" }, take: 500 },
      createdBy: { select: { email: true, fullName: true } },
      rollbacks: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function listImportJobsForUser(userId: string, take = 40) {
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

export async function listExportJobsForUser(userId: string, take = 40) {
  return prisma.exportJob.findMany({
    where: await exportJobListWhereForOwner(userId),
    orderBy: { createdAt: "desc" },
    take,
    include: { createdBy: { select: { email: true, fullName: true } } },
  });
}

export async function listValidationErrorPreviewRows(userId: string, take = 120) {
  const jobScope = await importJobListWhereForOwner(userId);
  return prisma.importJobPreviewRow.findMany({
    where: {
      validationStatus: ImportPreviewRowStatus.ERROR,
      importJob: jobScope,
    },
    orderBy: { createdAt: "desc" },
    take,
    include: { importJob: { select: { id: true, filename: true, type: true, createdAt: true } } },
  });
}
