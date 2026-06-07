import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  REFERRAL_PROGRAM_PAGE_PATH,
  REFERRAL_PROGRAM_ABSOLUTE_FINAL_POLICY_ID,
  REFERRAL_PROGRAM_DOC,
  REFERRAL_PROGRAM_HONESTY_MARKERS,
  REFERRAL_PROGRAM_REQUIRED_SECTIONS,
  REFERRAL_PROGRAM_WIRING_PATHS,
} from "@/lib/marketing/referral-program-absolute-final-policy";

export type ReferralProgramAbsoluteFinalAudit = {
  ok: boolean;
  failures: string[];
  sectionCount: number;
};

export function auditReferralProgramAbsoluteFinalDoc(source: string): {
  missingSections: string[];
  sectionCount: number;
} {
  const missingSections = REFERRAL_PROGRAM_REQUIRED_SECTIONS.filter(
    (section) => !source.includes(section),
  );
  return {
    missingSections,
    sectionCount: REFERRAL_PROGRAM_REQUIRED_SECTIONS.length - missingSections.length,
  };
}

export function auditReferralProgramAbsoluteFinalWiring(
  root = process.cwd(),
): ReferralProgramAbsoluteFinalAudit {
  const failures: string[] = [];

  for (const rel of REFERRAL_PROGRAM_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const doc = readFileSync(join(root, REFERRAL_PROGRAM_DOC), "utf8");
  const docAudit = auditReferralProgramAbsoluteFinalDoc(doc);

  if (docAudit.missingSections.length > 0) {
    failures.push(`missing sections: ${docAudit.missingSections.join(", ")}`);
  }

  if (!doc.includes(REFERRAL_PROGRAM_ABSOLUTE_FINAL_POLICY_ID)) {
    failures.push("referral-program.md missing absolute final policy id");
  }

  for (const marker of REFERRAL_PROGRAM_HONESTY_MARKERS) {
    if (!doc.includes(marker) && !doc.toLowerCase().includes(marker.toLowerCase())) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  const panelSource = readFileSync(
    join(root, "components/dashboard/referral-program-panel.tsx"),
    "utf8",
  );
  if (!panelSource.includes("data-referral-program-panel")) {
    failures.push("panel missing root test id");
  }
  if (!panelSource.includes("data-referral-program-copy-link")) {
    failures.push("panel missing copy link test id");
  }

  for (const marker of REFERRAL_PROGRAM_HONESTY_MARKERS) {
    if (!panelSource.includes(marker) && !panelSource.toLowerCase().includes(marker.toLowerCase())) {
      failures.push(`panel missing honesty marker: ${marker}`);
    }
  }

  const referralsPage = readFileSync(join(root, REFERRAL_PROGRAM_PAGE_PATH), "utf8");
  if (!referralsPage.includes("ReferralProgramPanel")) {
    failures.push("referrals page missing ReferralProgramPanel");
  }

  const settingsPage = readFileSync(
    join(root, "app/dashboard/settings/referrals/page.tsx"),
    "utf8",
  );
  if (!settingsPage.includes("ReferralProgramPanel")) {
    failures.push("settings referrals page missing ReferralProgramPanel");
  }

  const serviceSource = readFileSync(
    join(root, "services/referral/referral-service.ts"),
    "utf8",
  );
  if (!serviceSource.includes("getReferralDashboard")) {
    failures.push("referral service missing getReferralDashboard");
  }
  if (!serviceSource.includes("processReferralConversion")) {
    failures.push("referral service missing processReferralConversion");
  }

  const freePilotDoc = existsSync(join(root, "docs/free-pilot-tier-program.md"))
    ? readFileSync(join(root, "docs/free-pilot-tier-program.md"), "utf8")
    : "";
  if (freePilotDoc && !freePilotDoc.includes("referral-program.md")) {
    failures.push("free-pilot-tier-program.md missing link to referral program");
  }

  return {
    ok: failures.length === 0,
    failures,
    sectionCount: docAudit.sectionCount,
  };
}
