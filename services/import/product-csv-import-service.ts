/**
 * One-shot product CSV import — wraps Import Center commit path.
 */
import { commitImportJob, uploadImportCsv } from "@/services/import-center/import-center-service";

export type ProductCsvImportResult =
  | { imported: number; errors: number; importJobId: string }
  | { imported: 0; errors: number; error: string };

export async function importProductsFromCSV(
  userId: string,
  csvContent: string,
  filename = "products.csv",
): Promise<ProductCsvImportResult> {
  const upload = await uploadImportCsv({
    userId,
    type: "PRODUCTS",
    filename,
    csvText: csvContent,
    commitMode: "CREATE_ONLY",
  });

  if (!upload.ok) {
    return { imported: 0, errors: 1, error: upload.error };
  }

  const commit = await commitImportJob({
    userId,
    jobId: upload.importJobId,
    includeWarnings: false,
  });

  if (!commit.ok) {
    return { imported: 0, errors: 1, error: commit.error };
  }

  return {
    imported: commit.outcome.created,
    errors: commit.outcome.rejected,
    importJobId: upload.importJobId,
  };
}
