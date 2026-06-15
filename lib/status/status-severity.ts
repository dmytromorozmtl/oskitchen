export type OperationalSeverity = "none" | "info" | "warning" | "blocker";

export function severityFromBlockerCount(count: number): OperationalSeverity {
  if (count <= 0) return "none";
  if (count === 1) return "warning";
  return "blocker";
}
