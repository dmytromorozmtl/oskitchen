import type { TrainingProgressStatus } from "@prisma/client";

export type ProgressInput = {
  startedAt?: Date | null;
  completedAt?: Date | null;
  progressPercent: number;
  passedQuiz?: boolean;
};

export function deriveProgressStatus(input: ProgressInput): TrainingProgressStatus {
  if (input.completedAt) {
    if (input.passedQuiz === false) return "FAILED";
    return "COMPLETED";
  }
  if (input.startedAt || input.progressPercent > 0) return "IN_PROGRESS";
  return "NOT_STARTED";
}

export function clampProgressPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}
