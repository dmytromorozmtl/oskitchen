import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_TERMINAL_ICON_BUTTON_LABELS_POLICY_ID,
  POS_TERMINAL_ICON_BUTTON_MODULES,
  type PosTerminalIconButtonModule,
} from "@/lib/pos/pos-terminal-icon-button-labels";

/**
 * DES-35 — POS terminal icon-only Button aria-label audit.
 */

export const POS_TERMINAL_ICON_BUTTON_AUDIT_POLICY_ID =
  POS_TERMINAL_ICON_BUTTON_LABELS_POLICY_ID;

export type PosTerminalIconButtonViolation = {
  line: number;
  excerpt: string;
};

type ButtonOpenTag = {
  line: number;
  tag: string;
};

function extractButtonOpenTags(source: string): ButtonOpenTag[] {
  const tags: ButtonOpenTag[] = [];
  let index = 0;

  while (index < source.length) {
    const start = source.indexOf("<Button", index);
    if (start === -1) break;

    let end = start + 7;
    let braceDepth = 0;
    let inString: '"' | "'" | null = null;

    while (end < source.length) {
      const char = source[end]!;
      if (inString) {
        if (char === inString && source[end - 1] !== "\\") inString = null;
      } else if (char === '"' || char === "'") {
        inString = char;
      } else if (char === "{") {
        braceDepth += 1;
      } else if (char === "}") {
        braceDepth -= 1;
      } else if (char === ">" && braceDepth === 0) {
        end += 1;
        break;
      }
      end += 1;
    }

    tags.push({
      line: source.slice(0, start).split("\n").length,
      tag: source.slice(start, end),
    });
    index = end;
  }

  return tags;
}

export function findPosTerminalIconButtonViolations(
  source: string,
): PosTerminalIconButtonViolation[] {
  const violations: PosTerminalIconButtonViolation[] = [];

  for (const { line, tag } of extractButtonOpenTags(source)) {
    if (!/size="icon"/.test(tag)) continue;
    if (/aria-label=/.test(tag)) continue;
    violations.push({
      line,
      excerpt: tag.replace(/\s+/g, " ").trim(),
    });
  }

  return violations;
}

export type PosTerminalIconButtonModuleAudit = {
  module: PosTerminalIconButtonModule;
  violations: PosTerminalIconButtonViolation[];
  passed: boolean;
};

export type PosTerminalIconButtonAuditReport = {
  policyId: typeof POS_TERMINAL_ICON_BUTTON_AUDIT_POLICY_ID;
  modules: PosTerminalIconButtonModuleAudit[];
  passed: boolean;
};

export function auditPosTerminalIconButtonModule(
  modulePath: PosTerminalIconButtonModule,
  root = process.cwd(),
): PosTerminalIconButtonModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const violations = findPosTerminalIconButtonViolations(source);
  return {
    module: modulePath,
    violations,
    passed: violations.length === 0,
  };
}

export function auditPosTerminalIconButtons(
  root = process.cwd(),
): PosTerminalIconButtonAuditReport {
  const modules = POS_TERMINAL_ICON_BUTTON_MODULES.map((modulePath) =>
    auditPosTerminalIconButtonModule(modulePath, root),
  );
  return {
    policyId: POS_TERMINAL_ICON_BUTTON_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
