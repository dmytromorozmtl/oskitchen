import type { PlaybookRunStepStatus, PlaybookStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { RUN_STATUS_LABEL, STEP_STATUS_LABEL } from "@/lib/playbooks/playbook-status";
import { cn } from "@/lib/utils";

const RUN_TONE: Record<PlaybookStatus, string> = {
  TEMPLATE: "bg-muted text-muted-foreground",
  READY: "bg-sky-100 text-sky-900",
  RUNNING: "bg-emerald-100 text-emerald-900",
  BLOCKED: "bg-amber-100 text-amber-900",
  COMPLETED: "bg-slate-100 text-slate-900",
  CANCELLED: "bg-rose-100 text-rose-900",
  ARCHIVED: "bg-muted text-muted-foreground",
};

const STEP_TONE: Record<PlaybookRunStepStatus, string> = {
  NOT_STARTED: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-emerald-100 text-emerald-900",
  BLOCKED: "bg-amber-100 text-amber-900",
  COMPLETED: "bg-sky-100 text-sky-900",
  SKIPPED: "bg-slate-100 text-slate-900",
};

export function RunStatusBadge({ status }: { status: PlaybookStatus }) {
  return (
    <Badge className={cn("rounded-full font-medium", RUN_TONE[status])}>
      {RUN_STATUS_LABEL[status]}
    </Badge>
  );
}

export function StepStatusBadge({ status }: { status: PlaybookRunStepStatus }) {
  return (
    <Badge className={cn("rounded-full font-medium", STEP_TONE[status])}>
      {STEP_STATUS_LABEL[status]}
    </Badge>
  );
}
