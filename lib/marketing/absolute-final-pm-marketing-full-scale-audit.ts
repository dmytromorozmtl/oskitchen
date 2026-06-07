import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  getPmMarketingFullScaleSlot,
  PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID,
  PM_MARKETING_FULL_SCALE_SLOTS,
  type PmMarketingFullScaleSlot,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-policy";
import {
  componentUsesPmGtmTokens,
  docUsesPmGtmTokens,
  PM_GTM_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-tokens";

export type PmMarketingFullScaleAudit = {
  ok: boolean;
  failures: string[];
  slot?: PmMarketingFullScaleSlot;
};

export function auditPmMarketingFullScaleSlot(
  taskNumber: number,
  root = process.cwd(),
): PmMarketingFullScaleAudit {
  const failures: string[] = [];
  const slot = getPmMarketingFullScaleSlot(taskNumber);
  if (!slot) {
    return { ok: false, failures: [`unknown PM marketing slot task ${taskNumber}`] };
  }

  if (!existsSync(join(root, slot.gtmTest))) {
    failures.push(`missing GTM test: ${slot.gtmTest}`);
  } else {
    const gtmSource = readFileSync(join(root, slot.gtmTest), "utf8");
    if (!gtmSource.includes(`Absolute Final Task ${taskNumber}`)) {
      failures.push(`GTM test missing task ${taskNumber} marker`);
    }
    if (!gtmSource.includes(`feature ${slot.featureTaskNumber}`)) {
      failures.push(`GTM test missing feature ${slot.featureTaskNumber} marker`);
    }
    if (!gtmSource.includes(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID)) {
      failures.push("GTM test missing policy id reference");
    }
  }

  if (!existsSync(join(root, slot.targetPath))) {
    failures.push(`missing GTM target: ${slot.targetPath}`);
  } else if (slot.targetKind === "doc") {
    const targetSource = readFileSync(join(root, slot.targetPath), "utf8");
    if (!docUsesPmGtmTokens(targetSource)) {
      failures.push(`doc missing pm-gtm markers: ${slot.targetPath}`);
    }
  } else if (slot.targetKind === "component") {
    const targetSource = readFileSync(join(root, slot.targetPath), "utf8");
    if (!componentUsesPmGtmTokens(targetSource)) {
      failures.push(`component missing pm-gtm tokens: ${slot.targetPath}`);
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

export function auditPmMarketingFullScaleRegistry(root = process.cwd()): PmMarketingFullScaleAudit {
  const failures: string[] = [];

  if (PM_MARKETING_FULL_SCALE_SLOTS.length !== 15) {
    failures.push(`expected 15 PM marketing slots, got ${PM_MARKETING_FULL_SCALE_SLOTS.length}`);
  }

  const policySource = readFileSync(
    join(root, "lib/marketing/absolute-final-pm-marketing-full-scale-policy.ts"),
    "utf8",
  );
  if (!policySource.includes(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID)) {
    failures.push("policy missing policy id");
  }

  for (const slot of PM_MARKETING_FULL_SCALE_SLOTS) {
    if (slot.taskNumber !== slot.featureTaskNumber + 45) {
      failures.push(
        `slot ${slot.taskNumber} feature mapping off: feature ${slot.featureTaskNumber}`,
      );
    }
  }

  if (PM_GTM_ABSOLUTE_FINAL_POLICY_ID !== PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID) {
    failures.push("token policy id mismatch");
  }

  return { ok: failures.length === 0, failures };
}
