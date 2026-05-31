export type OperationalInsightSeverity = "INFO" | "WARN" | "CRITICAL";

export type OperationalInsight = {
  id: string;
  severity: OperationalInsightSeverity;
  title: string;
  summary: string;
  actionRoute?: string;
  /** OS Kitchen policy: autonomous writes always false here. */
  requiresApproval: true;
};
