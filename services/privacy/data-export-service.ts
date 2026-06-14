export type DataExportRequestStatus = "NOT_STARTED" | "REQUESTED" | "IN_PROGRESS" | "READY" | "FAILED";

/**
 * Placeholder export workflow — wire to `AuditExport` + storage when enterprise export SLAs are finalized.
 */
export function describeDataExportRequest(): {
  status: DataExportRequestStatus;
  notes: string[];
} {
  return {
    status: "NOT_STARTED",
    notes: [
      "Use existing audit export surfaces where available.",
      "Broad workspace exports may require DPA + security review before automation.",
    ],
  };
}
