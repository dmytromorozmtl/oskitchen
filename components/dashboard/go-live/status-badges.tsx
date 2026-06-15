import type {
  GoLiveBlockerSeverity,
  GoLiveChecklistStatus,
  GoLiveIncidentSeverity,
  GoLiveIncidentStatus,
  GoLiveLaunchStatus,
  GoLiveRiskLevel,
  GoLiveSimulationResult,
} from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import {
  BLOCKER_SEVERITY_LABEL,
  BLOCKER_SEVERITY_TONE,
  LAUNCH_STATUS_LABEL,
  LAUNCH_STATUS_TONE,
  RISK_LEVEL_LABEL,
  RISK_LEVEL_TONE,
} from "@/lib/go-live/launch-stages";

const TONE_CLASS: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-sky-100 text-sky-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

export function LaunchStatusBadge({ status }: { status: GoLiveLaunchStatus }) {
  return <Badge className={TONE_CLASS[LAUNCH_STATUS_TONE[status]]}>{LAUNCH_STATUS_LABEL[status]}</Badge>;
}

export function RiskBadge({ level }: { level: GoLiveRiskLevel }) {
  return <Badge className={TONE_CLASS[RISK_LEVEL_TONE[level]]}>{RISK_LEVEL_LABEL[level]} risk</Badge>;
}

export function BlockerSeverityBadge({ severity }: { severity: GoLiveBlockerSeverity }) {
  return <Badge className={TONE_CLASS[BLOCKER_SEVERITY_TONE[severity]]}>{BLOCKER_SEVERITY_LABEL[severity]}</Badge>;
}

const CHECKLIST_TONE: Record<GoLiveChecklistStatus, string> = {
  TODO: "neutral",
  IN_PROGRESS: "info",
  NEEDS_REVIEW: "warning",
  BLOCKED: "danger",
  DONE: "success",
  WAIVED: "neutral",
};

export function ChecklistStatusBadge({ status }: { status: GoLiveChecklistStatus }) {
  return <Badge className={TONE_CLASS[CHECKLIST_TONE[status]]}>{status.replaceAll("_", " ")}</Badge>;
}

const SIM_TONE: Record<GoLiveSimulationResult, string> = {
  PENDING: "neutral",
  RUNNING: "info",
  PASSED: "success",
  WARNING: "warning",
  FAILED: "danger",
};

export function SimulationResultBadge({ result }: { result: GoLiveSimulationResult }) {
  return <Badge className={TONE_CLASS[SIM_TONE[result]]}>{result.replaceAll("_", " ")}</Badge>;
}

const INC_SEV_TONE: Record<GoLiveIncidentSeverity, string> = {
  INFO: "info",
  WARNING: "warning",
  MAJOR: "warning",
  CRITICAL: "danger",
};

const INC_STATUS_TONE: Record<GoLiveIncidentStatus, string> = {
  OPEN: "danger",
  ACKNOWLEDGED: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  CLOSED: "neutral",
};

export function IncidentSeverityBadge({ severity }: { severity: GoLiveIncidentSeverity }) {
  return <Badge className={TONE_CLASS[INC_SEV_TONE[severity]]}>{severity}</Badge>;
}

export function IncidentStatusBadge({ status }: { status: GoLiveIncidentStatus }) {
  return <Badge className={TONE_CLASS[INC_STATUS_TONE[status]]}>{status.replaceAll("_", " ")}</Badge>;
}
