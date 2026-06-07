import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  NEW_COMPONENTS_DARK_MODE_MODULES,
  NEW_COMPONENTS_DARK_MODE_UNIT_TEST,
} from "@/lib/design/new-components-dark-mode-audit-policy";

export type NewComponentsDarkModeWiringAudit = {
  ok: boolean;
  failures: string[];
};

export function auditNewComponentsDarkModeWiring(root = process.cwd()): NewComponentsDarkModeWiringAudit {
  const failures: string[] = [];

  for (const rel of NEW_COMPONENTS_DARK_MODE_MODULES) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing module: ${rel}`);
    }
  }

  if (!existsSync(join(root, NEW_COMPONENTS_DARK_MODE_UNIT_TEST))) {
    failures.push(`missing unit test: ${NEW_COMPONENTS_DARK_MODE_UNIT_TEST}`);
  }

  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  if (!pkg.scripts?.["test:ci:new-components-dark-mode-audit:cert"]) {
    failures.push("package.json missing test:ci:new-components-dark-mode-audit:cert");
  }

  return { ok: failures.length === 0, failures };
}
