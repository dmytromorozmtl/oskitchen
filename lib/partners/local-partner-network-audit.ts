import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LOCAL_PARTNER_NETWORK_DOC,
  LOCAL_PARTNER_NETWORK_FORBIDDEN_CLAIMS,
  LOCAL_PARTNER_NETWORK_HONESTY_MARKERS,
  LOCAL_PARTNER_NETWORK_ABSOLUTE_FINAL_POLICY_ID,
  LOCAL_PARTNER_NETWORK_ONBOARDING_STEPS,
  LOCAL_PARTNER_NETWORK_PARTNER_SEGMENTS,
  LOCAL_PARTNER_NETWORK_REQUIRED_SECTIONS,
  LOCAL_PARTNER_NETWORK_STRATEGY_DOC,
  LOCAL_PARTNER_NETWORK_TIERS,
  LOCAL_PARTNER_NETWORK_WIRING_PATHS,
} from "@/lib/partners/local-partner-network-absolute-final-policy";

export type LocalPartnerNetworkAudit = {
  ok: boolean;
  failures: string[];
  sectionCount: number;
};

export function auditLocalPartnerNetworkDoc(source: string): {
  missingSections: string[];
  sectionCount: number;
} {
  const missingSections = LOCAL_PARTNER_NETWORK_REQUIRED_SECTIONS.filter(
    (section) => !source.includes(section),
  );
  return {
    missingSections,
    sectionCount: LOCAL_PARTNER_NETWORK_REQUIRED_SECTIONS.length - missingSections.length,
  };
}

export function auditLocalPartnerNetworkWiring(root = process.cwd()): LocalPartnerNetworkAudit {
  const failures: string[] = [];

  for (const rel of LOCAL_PARTNER_NETWORK_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const doc = readFileSync(join(root, LOCAL_PARTNER_NETWORK_DOC), "utf8");
  const docAudit = auditLocalPartnerNetworkDoc(doc);

  if (docAudit.missingSections.length > 0) {
    failures.push(`missing sections: ${docAudit.missingSections.join(", ")}`);
  }

  if (!doc.includes(LOCAL_PARTNER_NETWORK_ABSOLUTE_FINAL_POLICY_ID)) {
    failures.push("onboarding doc missing absolute final policy id");
  }

  for (const marker of LOCAL_PARTNER_NETWORK_HONESTY_MARKERS) {
    if (!doc.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  for (const claim of LOCAL_PARTNER_NETWORK_FORBIDDEN_CLAIMS) {
    if (!doc.includes(claim)) {
      failures.push(`missing forbidden claim reference: ${claim}`);
    }
  }

  for (const step of LOCAL_PARTNER_NETWORK_ONBOARDING_STEPS) {
    if (!doc.includes(step)) {
      failures.push(`missing onboarding step: ${step}`);
    }
  }

  for (const tier of LOCAL_PARTNER_NETWORK_TIERS) {
    if (!doc.includes(tier)) {
      failures.push(`missing partner tier: ${tier}`);
    }
  }

  const segmentLabels = [
    "Restaurant tech consultant",
    "POS installer",
    "Restaurant accountant",
    "Commissary",
    "Culinary",
  ];
  for (const label of segmentLabels) {
    if (!doc.includes(label)) {
      failures.push(`missing partner segment label: ${label}`);
    }
  }

  if (LOCAL_PARTNER_NETWORK_PARTNER_SEGMENTS.length !== 5) {
    failures.push("expected five partner segments in policy");
  }

  const strategyDoc = readFileSync(join(root, LOCAL_PARTNER_NETWORK_STRATEGY_DOC), "utf8");
  if (!strategyDoc.includes("local-partner-network-onboarding.md")) {
    failures.push("restaurant-partnerships-strategy.md missing link to local partner onboarding");
  }

  return {
    ok: failures.length === 0,
    failures,
    sectionCount: docAudit.sectionCount,
  };
}
