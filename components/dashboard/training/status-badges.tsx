import type {
  SOPStatus,
  TrainingAssignmentStatus,
  TrainingProgressStatus,
} from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import {
  ASSIGNMENT_STATUS_LABEL,
  ASSIGNMENT_STATUS_TONE,
  PROGRESS_STATUS_LABEL,
} from "@/lib/training/training-engine";
import { SOP_STATUS_LABEL, SOP_STATUS_TONE } from "@/lib/training/sop-engine";

const TONE_CLASS: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-sky-100 text-sky-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

export function AssignmentStatusBadge({ status }: { status: TrainingAssignmentStatus }) {
  return <Badge className={TONE_CLASS[ASSIGNMENT_STATUS_TONE[status]]}>{ASSIGNMENT_STATUS_LABEL[status]}</Badge>;
}

const PROGRESS_TONE: Record<TrainingProgressStatus, string> = {
  NOT_STARTED: "neutral",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  FAILED: "danger",
};

export function ProgressStatusBadge({ status }: { status: TrainingProgressStatus }) {
  return <Badge className={TONE_CLASS[PROGRESS_TONE[status]]}>{PROGRESS_STATUS_LABEL[status]}</Badge>;
}

export function SopStatusBadge({ status }: { status: SOPStatus }) {
  return <Badge className={TONE_CLASS[SOP_STATUS_TONE[status]]}>{SOP_STATUS_LABEL[status]}</Badge>;
}
