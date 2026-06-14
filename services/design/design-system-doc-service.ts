import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DESIGN_SYSTEM_DOC_ANCHORS,
  DESIGN_SYSTEM_DOC_PATH,
  DESIGN_SYSTEM_DOC_POLICY_ID,
  DESIGN_SYSTEM_POLICY_MODULES,
} from "@/lib/design/design-system-doc-policy";

export type DesignSystemDocSectionCheck = {
  anchor: (typeof DESIGN_SYSTEM_DOC_ANCHORS)[number];
  present: boolean;
};

export type DesignSystemDocSnapshot = {
  policyId: typeof DESIGN_SYSTEM_DOC_POLICY_ID;
  docPath: typeof DESIGN_SYSTEM_DOC_PATH;
  sections: DesignSystemDocSectionCheck[];
  policyModuleCount: number;
  healthScore: number;
  passed: boolean;
};

export function validateDesignSystemDocSections(
  source = readFileSync(join(process.cwd(), DESIGN_SYSTEM_DOC_PATH), "utf8"),
): DesignSystemDocSectionCheck[] {
  return DESIGN_SYSTEM_DOC_ANCHORS.map((anchor) => ({
    anchor,
    present: source.includes(anchor),
  }));
}

export function loadDesignSystemDocSnapshot(root = process.cwd()): DesignSystemDocSnapshot {
  const source = readFileSync(join(root, DESIGN_SYSTEM_DOC_PATH), "utf8");
  const sections = validateDesignSystemDocSections(source);
  const presentCount = sections.filter((s) => s.present).length;
  const healthScore =
    sections.length === 0 ? 0 : Math.round((presentCount / sections.length) * 100);

  return {
    policyId: DESIGN_SYSTEM_DOC_POLICY_ID,
    docPath: DESIGN_SYSTEM_DOC_PATH,
    sections,
    policyModuleCount: DESIGN_SYSTEM_POLICY_MODULES.length,
    healthScore,
    passed: sections.every((s) => s.present),
  };
}
