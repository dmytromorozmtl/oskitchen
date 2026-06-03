import type { CoPilotExceptionEntry } from "@/lib/ai/co-pilot-autonomous-types";
import {
  DEFAULT_CO_PILOT_AUTONOMOUS_SETTINGS,
  type CoPilotAutonomousSettings,
} from "@/lib/ai/co-pilot-autonomous-types";

export const CO_PILOT_AUTONOMOUS_STORAGE_KEY = "coPilotAutonomous";

export type CoPilotAutonomousStorage = CoPilotAutonomousSettings & {
  exceptionLog?: CoPilotExceptionEntry[];
};

const MAX_EXCEPTIONS = 48;

export function parseCoPilotAutonomousStorage(raw: unknown): CoPilotAutonomousStorage {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_CO_PILOT_AUTONOMOUS_SETTINGS, exceptionLog: [] };
  }
  const o = raw as Record<string, unknown>;
  const exceptionLog = Array.isArray(o.exceptionLog)
    ? (o.exceptionLog as CoPilotExceptionEntry[]).slice(0, MAX_EXCEPTIONS)
    : [];

  return {
    enabled: o.enabled === true,
    autoRunSafeActions: o.autoRunSafeActions !== false,
    lastDigestAt: typeof o.lastDigestAt === "string" ? o.lastDigestAt : null,
    lastRunAt: typeof o.lastRunAt === "string" ? o.lastRunAt : null,
    exceptionLog,
  };
}

export function readCoPilotAutonomousStorage(settingsCenterJson: unknown): CoPilotAutonomousStorage {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object" || Array.isArray(settingsCenterJson)) {
    return { ...DEFAULT_CO_PILOT_AUTONOMOUS_SETTINGS, exceptionLog: [] };
  }
  const raw = (settingsCenterJson as Record<string, unknown>)[CO_PILOT_AUTONOMOUS_STORAGE_KEY];
  return parseCoPilotAutonomousStorage(raw);
}

export function appendExceptionLog(
  existing: CoPilotExceptionEntry[],
  entry: CoPilotExceptionEntry,
): CoPilotExceptionEntry[] {
  return [entry, ...existing].slice(0, MAX_EXCEPTIONS);
}
