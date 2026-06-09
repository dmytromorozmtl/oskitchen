import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  assertApiMutationRateLimitAuditPasses,
  auditApiMutationRateLimit,
} from "./lib/api-mutation-rate-limit-audit";
import { API_MUTATION_RATE_LIMIT_AUDIT_ARTIFACT } from "@/lib/qa/api-mutation-rate-limit-policy";

const root = process.cwd();
const report = auditApiMutationRateLimit(root);

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

if (process.argv.includes("--write")) {
  const artifactPath = join(root, API_MUTATION_RATE_LIMIT_AUDIT_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(
    artifactPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), ...report }, null, 2)}\n`,
    "utf8",
  );
  console.log(`[api-mutation-rate-limit] artifact → ${API_MUTATION_RATE_LIMIT_AUDIT_ARTIFACT}`);
}
