import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  IPAD_NATIVE_POS_POLISH_TERMINAL_MODULE,
  IPAD_NATIVE_POS_POLISH_WIRING_PATHS,
} from "@/lib/pos/ipad-native-pos-polish-policy";
import { POS_TABLET_POS_CLIENT_MODULE } from "@/lib/pos/pos-tablet-pos-policy";

export type IpadNativePosPolishAudit = {
  ok: boolean;
  failures: string[];
};

export function auditIpadNativePosPolishWiring(root = process.cwd()): IpadNativePosPolishAudit {
  const failures: string[] = [];

  for (const rel of IPAD_NATIVE_POS_POLISH_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const tabletClient = readFileSync(join(root, POS_TABLET_POS_CLIENT_MODULE), "utf8");
  if (!tabletClient.includes("ipad-native-pos-polish-policy")) {
    failures.push("pos-tablet-client.tsx missing ipad-native-pos-polish-policy import");
  }
  if (!tabletClient.includes("posIpadNativeShellClass")) {
    failures.push("pos-tablet-client.tsx missing posIpadNativeShellClass");
  }

  const terminal = readFileSync(join(root, IPAD_NATIVE_POS_POLISH_TERMINAL_MODULE), "utf8");
  if (!terminal.includes("triggerIpadNativePosHaptic")) {
    failures.push("pos-terminal-client.tsx missing triggerIpadNativePosHaptic");
  }
  if (!terminal.includes("createPosTabletSwipeHandlers")) {
    failures.push("pos-terminal-client.tsx missing createPosTabletSwipeHandlers");
  }
  if (!terminal.includes("data-ipad-native-polish")) {
    failures.push("pos-terminal-client.tsx missing data-ipad-native-polish marker");
  }

  return { ok: failures.length === 0, failures };
}
