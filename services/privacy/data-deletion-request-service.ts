export type DataDeletionRequestStatus = "NOT_STARTED" | "REVIEW_REQUIRED" | "SCHEDULED" | "COMPLETED";

/**
 * GDPR-style deletion is operator-assisted today — this module documents the intended workflow only.
 */
export function describeDataDeletionRequest(): {
  status: DataDeletionRequestStatus;
  notes: string[];
} {
  return {
    status: "REVIEW_REQUIRED",
    notes: [
      "Workspace deletion cascades must be reviewed for billing + legal holds.",
      "Customer PII minimization already relies on structured CRM fields — extend with ticket linkage later.",
    ],
  };
}
