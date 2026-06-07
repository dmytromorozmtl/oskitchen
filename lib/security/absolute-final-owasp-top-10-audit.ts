import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  OWASP_TOP_10_ABSOLUTE_FINAL_POLICY_ID,
  OWASP_TOP_10_CATEGORIES,
  OWASP_TOP_10_CATEGORY_COUNT,
  OWASP_TOP_10_DOC_PATH,
  OWASP_TOP_10_VERSION,
  OWASP_TOP_10_WIRING_PATHS,
} from "@/lib/security/absolute-final-owasp-top-10-policy";

export type OwaspTop10Audit = {
  ok: boolean;
  failures: string[];
};

export function auditOwaspTop10Wiring(root = process.cwd()): OwaspTop10Audit {
  const failures: string[] = [];

  for (const rel of OWASP_TOP_10_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  if (OWASP_TOP_10_CATEGORIES.length !== OWASP_TOP_10_CATEGORY_COUNT) {
    failures.push(`expected ${OWASP_TOP_10_CATEGORY_COUNT} OWASP categories`);
  }

  for (const category of OWASP_TOP_10_CATEGORIES) {
    for (const rel of category.controlPaths) {
      if (!existsSync(join(root, rel))) {
        failures.push(`missing ${category.id} control path: ${rel}`);
      }
    }
  }

  const docSource = readFileSync(join(root, OWASP_TOP_10_DOC_PATH), "utf8");
  if (!docSource.includes("OWASP Top 10")) {
    failures.push("security review doc missing OWASP Top 10 reference");
  }
  if (!docSource.includes(OWASP_TOP_10_VERSION)) {
    failures.push("security review doc missing OWASP version");
  }
  if (!docSource.includes(OWASP_TOP_10_ABSOLUTE_FINAL_POLICY_ID)) {
    failures.push("security review doc missing OWASP policy id");
  }

  for (const category of OWASP_TOP_10_CATEGORIES) {
    if (!docSource.includes(category.id)) {
      failures.push(`security review doc missing ${category.id} category`);
    }
  }

  const middleware = readFileSync(join(root, "middleware.ts"), "utf8");
  if (!middleware.includes("enforceApiMutationRateLimitMiddleware")) {
    failures.push("middleware missing API mutation rate limit");
  }

  const ci = readFileSync(join(root, ".github/workflows/ci.yml"), "utf8");
  if (!ci.includes("audit:dependencies:high")) {
    failures.push("CI workflow missing npm audit high gate");
  }

  const rateLimitAudit = readFileSync(
    join(root, "scripts/lib/api-mutation-rate-limit-audit.ts"),
    "utf8",
  );
  if (!rateLimitAudit.includes("enforceApiRateLimit")) {
    failures.push("api mutation rate limit audit missing enforceApiRateLimit marker");
  }

  const penTest = readFileSync(join(root, "docs/pen-test-plan.md"), "utf8");
  if (!penTest.includes("SSRF")) {
    failures.push("pen test plan missing SSRF coverage");
  }

  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  if (!pkg.scripts?.["audit:dependencies:high"]) {
    failures.push("package.json missing audit:dependencies:high script");
  }
  if (!pkg.scripts?.["test:security"]) {
    failures.push("package.json missing test:security script");
  }

  return { ok: failures.length === 0, failures };
}
