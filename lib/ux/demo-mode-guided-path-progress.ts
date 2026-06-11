import {
  DEMO_MODE_GUIDED_PATH_STORAGE_KEY,
  DEMO_MODE_GUIDED_PATH_STEPS,
  type DemoModeGuidedPathStepId,
  resolveDemoModeGuidedPathStepFromPathname,
} from "@/lib/ux/demo-mode-guided-path-policy";

type StoredProgress = {
  completedSteps?: DemoModeGuidedPathStepId[];
  startedAt?: string;
};

function readRaw(): StoredProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DEMO_MODE_GUIDED_PATH_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredProgress;
  } catch {
    return {};
  }
}

function writeRaw(data: StoredProgress) {
  localStorage.setItem(DEMO_MODE_GUIDED_PATH_STORAGE_KEY, JSON.stringify(data));
}

export function readDemoModeGuidedPathProgress(): DemoModeGuidedPathStepId[] {
  const parsed = readRaw();
  const steps = parsed.completedSteps ?? [];
  const valid = new Set(DEMO_MODE_GUIDED_PATH_STEPS.map((step) => step.id));
  return steps.filter((id): id is DemoModeGuidedPathStepId => valid.has(id));
}

export function startDemoModeGuidedPath(): DemoModeGuidedPathStepId[] {
  const startedAt = new Date().toISOString();
  writeRaw({ completedSteps: [], startedAt });
  return [];
}

export function markDemoModeGuidedPathStep(stepId: DemoModeGuidedPathStepId): DemoModeGuidedPathStepId[] {
  const current = readDemoModeGuidedPathProgress();
  if (current.includes(stepId)) return current;
  const next = [...current, stepId];
  writeRaw({ ...readRaw(), completedSteps: next });
  return next;
}

export function syncDemoModeGuidedPathFromPathname(pathname: string): DemoModeGuidedPathStepId[] {
  const stepId = resolveDemoModeGuidedPathStepFromPathname(pathname);
  if (!stepId) return readDemoModeGuidedPathProgress();
  return markDemoModeGuidedPathStep(stepId);
}

export function dismissDemoModeGuidedPath(): void {
  const allSteps = DEMO_MODE_GUIDED_PATH_STEPS.map((step) => step.id);
  writeRaw({ ...readRaw(), completedSteps: allSteps });
}
