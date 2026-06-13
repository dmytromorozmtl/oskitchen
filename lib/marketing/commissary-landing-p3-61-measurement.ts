import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditCommissaryKitchenSoftwareLandingWiring } from "@/lib/marketing/commissary-kitchen-software-landing-audit";
import {
  COMMISSARY_LANDING_P3_61_CANONICAL_PATH,
  COMMISSARY_LANDING_P3_61_LEGACY_PAGE,
  COMMISSARY_LANDING_P3_61_LEGACY_PATH,
  commissaryLandingPathsAligned,
} from "@/lib/marketing/commissary-landing-p3-61-policy";

export type CommissaryLandingContractValidation = {
  passed: boolean;
  pathsAligned: boolean;
  legacyRedirectWired: boolean;
  upstreamAuditOk: boolean;
  failures: string[];
};

export function validateCommissaryLandingContract(
  root = process.cwd(),
): CommissaryLandingContractValidation {
  const failures: string[] = [];

  if (!commissaryLandingPathsAligned()) {
    failures.push("commissary landing path constants are not aligned to /commissary-kitchen-software");
  }

  let legacyRedirectWired = false;
  const legacyPath = join(root, COMMISSARY_LANDING_P3_61_LEGACY_PAGE);
  if (!existsSync(legacyPath)) {
    failures.push(`missing legacy redirect page: ${COMMISSARY_LANDING_P3_61_LEGACY_PAGE}`);
  } else {
    const source = readFileSync(legacyPath, "utf8");
    legacyRedirectWired =
      (source.includes("redirect") || source.includes("Redirect")) &&
      source.includes(COMMISSARY_LANDING_P3_61_CANONICAL_PATH);
    if (!legacyRedirectWired) {
      failures.push(`${COMMISSARY_LANDING_P3_61_LEGACY_PATH} must redirect to ${COMMISSARY_LANDING_P3_61_CANONICAL_PATH}`);
    }
  }

  const upstream = auditCommissaryKitchenSoftwareLandingWiring(root);
  if (!upstream.ok) {
    failures.push(...upstream.failures);
  }

  return {
    passed: failures.length === 0 && commissaryLandingPathsAligned() && upstream.ok,
    pathsAligned: commissaryLandingPathsAligned(),
    legacyRedirectWired,
    upstreamAuditOk: upstream.ok,
    failures,
  };
}
