import type { ImportType } from "@prisma/client";

export type ImportWizardKind = ImportType;

export type ImportPreviewSummary = {
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  duplicateRows: number;
  createCount: number;
  updateCount: number;
  skipCount: number;
};

export type ImportRowIssue = { code: string; message: string };
