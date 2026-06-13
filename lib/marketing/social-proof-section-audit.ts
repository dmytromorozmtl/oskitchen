import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SOCIAL_PROOF_REQUIRED_MARKERS,
  SOCIAL_PROOF_SECTION_TEST_ID,
} from "@/lib/marketing/social-proof-section-content";

export type SocialProofSectionWiringAudit = {
  ok: boolean;
  failures: string[];
};

export function auditSocialProofSectionWiring(root = process.cwd()): SocialProofSectionWiringAudit {
  const failures: string[] = [];
  const paths = [
    "components/marketing/social-proof-section.tsx",
    "lib/marketing/social-proof-section-content.ts",
  ];

  for (const rel of paths) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(
    join(root, "components/marketing/social-proof-section.tsx"),
    "utf8",
  );

  for (const marker of SOCIAL_PROOF_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`social proof component missing marker: ${marker}`);
    }
  }

  return { ok: failures.length === 0, failures };
}

export function landingUsesSocialProofSection(
  landingComponentPath: string,
  root = process.cwd(),
): boolean {
  const path = join(root, landingComponentPath);
  if (!existsSync(path)) {
    return false;
  }
  const source = readFileSync(path, "utf8");
  return source.includes("SocialProofSection") && source.includes(SOCIAL_PROOF_SECTION_TEST_ID);
}
