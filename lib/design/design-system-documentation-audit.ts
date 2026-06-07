import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DESIGN_SYSTEM_DOCUMENTATION_DOC_PATH,
  DESIGN_SYSTEM_DOCUMENTATION_SECTION_ANCHORS,
  DESIGN_SYSTEM_TOP_20_COMPONENTS,
  DESIGN_SYSTEM_DOCUMENTATION_WIRING_PATHS,
} from "@/lib/design/design-system-documentation-absolute-final-policy";

export type DesignSystemDocumentationAudit = {
  ok: boolean;
  failures: string[];
};

export function auditDesignSystemDocumentation(root = process.cwd()): DesignSystemDocumentationAudit {
  const failures: string[] = [];

  for (const rel of DESIGN_SYSTEM_DOCUMENTATION_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const doc = readFileSync(join(root, DESIGN_SYSTEM_DOCUMENTATION_DOC_PATH), "utf8");

  for (const anchor of DESIGN_SYSTEM_DOCUMENTATION_SECTION_ANCHORS) {
    if (!doc.includes(anchor)) {
      failures.push(`docs/design-system.md missing section: ${anchor}`);
    }
  }

  for (const component of DESIGN_SYSTEM_TOP_20_COMPONENTS) {
    if (!doc.includes(component.path)) {
      failures.push(`docs/design-system.md missing top-20 component: ${component.path}`);
    }
    if (!existsSync(join(root, component.path))) {
      failures.push(`missing component file: ${component.path}`);
    }
  }

  if (!doc.includes("design-system-documentation-absolute-final-v1")) {
    failures.push("docs/design-system.md missing absolute final policy id");
  }

  return { ok: failures.length === 0, failures };
}
