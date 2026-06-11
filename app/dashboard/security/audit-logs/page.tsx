import { redirect } from "next/navigation";

export default function LegacySecurityAuditLogsRedirect() {
  redirect("/dashboard/audit-logs?from=security&tab=security");
}
