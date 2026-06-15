import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type ProgramStepId = 0 | 1 | 2 | 3 | 4 | 5;

export type ProgramStepRecord = {
  completedAt?: string;
  ok?: boolean;
  notes?: string;
  artifact?: string;
};

export type ProgramState = {
  version: 1;
  updatedAt: string;
  steps: Record<string, ProgramStepRecord>;
};

export const PROGRAM_STATE_PATH = join(process.cwd(), "docs", "artifacts", "BETA_PROGRAM_STATE.json");

export function loadProgramState(): ProgramState {
  if (!existsSync(PROGRAM_STATE_PATH)) {
    return { version: 1, updatedAt: new Date().toISOString(), steps: {} };
  }
  try {
    return JSON.parse(readFileSync(PROGRAM_STATE_PATH, "utf8")) as ProgramState;
  } catch {
    return { version: 1, updatedAt: new Date().toISOString(), steps: {} };
  }
}

export function markStep(state: ProgramState, step: ProgramStepId, record: ProgramStepRecord): void {
  state.steps[String(step)] = {
    ...state.steps[String(step)],
    ...record,
    completedAt: record.completedAt ?? new Date().toISOString(),
  };
  state.updatedAt = new Date().toISOString();
}

export function saveProgramState(state: ProgramState): void {
  mkdirSync(dirname(PROGRAM_STATE_PATH), { recursive: true });
  writeFileSync(PROGRAM_STATE_PATH, JSON.stringify(state, null, 2), "utf8");
}
