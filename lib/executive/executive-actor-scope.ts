import type { ExecutiveActorScope } from "@/lib/executive/executive-permissions";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";

export function createExecutiveActorScope(
  input: Parameters<typeof createReportActorScope>[0],
): ExecutiveActorScope {
  const scope = createReportActorScope(input);
  return {
    isOwner: scope.isOwner,
    role: scope.role,
    email: scope.email,
    granted: scope.granted,
    platformBypass: scope.platformBypass,
  };
}
