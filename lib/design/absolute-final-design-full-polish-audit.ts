import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  componentUsesDesignPolishTokens,
  DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_FULL_POLISH_SLOTS,
  getDesignFullPolishSlot,
  type DesignFullPolishSlot,
} from "@/lib/design/absolute-final-design-full-polish-policy";
import {
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  docUsesDesignPolishTokens,
} from "@/lib/design/absolute-final-design-polish-tokens";

export type DesignFullPolishAudit = {
  ok: boolean;
  failures: string[];
  slot?: DesignFullPolishSlot;
};

export function auditDesignFullPolishSlot(
  taskNumber: number,
  root = process.cwd(),
): DesignFullPolishAudit {
  const failures: string[] = [];
  const slot = getDesignFullPolishSlot(taskNumber);
  if (!slot) {
    return { ok: false, failures: [`unknown design polish slot task ${taskNumber}`] };
  }

  if (!existsSync(join(root, slot.polishTest))) {
    failures.push(`missing polish test: ${slot.polishTest}`);
  } else {
    const polishSource = readFileSync(join(root, slot.polishTest), "utf8");
    if (!polishSource.includes(`Absolute Final Task ${taskNumber}`)) {
      failures.push(`polish test missing task ${taskNumber} marker`);
    }
    if (!polishSource.includes(`feature ${slot.featureTaskNumber}`)) {
      failures.push(`polish test missing feature ${slot.featureTaskNumber} marker`);
    }
    if (!polishSource.includes(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID)) {
      failures.push("polish test missing policy id reference");
    }
  }

  if (!existsSync(join(root, slot.targetPath))) {
    failures.push(`missing polish target: ${slot.targetPath}`);
  } else if (slot.targetKind === "component") {
    const targetSource = readFileSync(join(root, slot.targetPath), "utf8");
    if (!componentUsesDesignPolishTokens(targetSource)) {
      failures.push(`component missing design polish tokens: ${slot.targetPath}`);
    }
    if (
      !targetSource.includes(DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID) &&
      !targetSource.includes("DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID")
    ) {
      failures.push(`component missing polish policy id marker: ${slot.targetPath}`);
    }
  } else if (slot.targetKind === "doc") {
    const targetSource = readFileSync(join(root, slot.targetPath), "utf8");
    if (!docUsesDesignPolishTokens(targetSource)) {
      failures.push(`doc missing design polish markers: ${slot.targetPath}`);
    }
  }

  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  if (!pkg.scripts?.[slot.ciCertScript]) {
    failures.push(`missing CI cert script: ${slot.ciCertScript}`);
  }

  return { ok: failures.length === 0, failures, slot };
}

export function auditDesignFullPolishRegistry(root = process.cwd()): DesignFullPolishAudit {
  const failures: string[] = [];

  if (DESIGN_FULL_POLISH_SLOTS.length !== 15) {
    failures.push(`expected 15 design polish slots, got ${DESIGN_FULL_POLISH_SLOTS.length}`);
  }

  const policySource = readFileSync(
    join(root, "lib/design/absolute-final-design-full-polish-policy.ts"),
    "utf8",
  );
  if (!policySource.includes(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID)) {
    failures.push("policy missing policy id");
  }

  for (const slot of DESIGN_FULL_POLISH_SLOTS) {
    if (slot.taskNumber !== slot.featureTaskNumber + 30) {
      failures.push(
        `slot ${slot.taskNumber} feature mapping off: feature ${slot.featureTaskNumber}`,
      );
    }
  }

  return { ok: failures.length === 0, failures };
}
