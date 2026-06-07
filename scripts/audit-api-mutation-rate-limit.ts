import {
  assertApiMutationRateLimitAuditPasses,
  auditApiMutationRateLimit,
} from "./lib/api-mutation-rate-limit-audit";

const report = auditApiMutationRateLimit(process.cwd());

console.log(
  JSON.stringify(
    {
      mutationRoutes: report.mutationRoutes,
      middlewareCovered: report.middlewareCovered,
      dedicatedCovered: report.dedicatedCovered,
      exemptClass: report.exemptClass,
    },
    null,
    2,
  ),
);

assertApiMutationRateLimitAuditPasses(report);
