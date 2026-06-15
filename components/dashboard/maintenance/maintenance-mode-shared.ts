import type { MaintenanceModeRhythmStatusKind } from "@/lib/commercial/maintenance-mode-phases-era24";
import { AlertCircle, CheckCircle2, Circle, Info } from "lucide-react";

export type MaintenanceModePanelVariant = "dashboard" | "platform" | "compact";

export type MaintenancePanelContext = {
  slice: import("@/lib/commercial/maintenance-mode-ui-era24").MaintenanceModeUiSlice;
  variant?: MaintenanceModePanelVariant;
  isPlatform: boolean;
  isCompact: boolean;
};

export function statusIcon(status: MaintenanceModeRhythmStatusKind) {
  if (status === "healthy") return CheckCircle2;
  if (status === "overdue") return AlertCircle;
  if (status === "due_soon") return Circle;
  return Info;
}

export function statusBadgeVariant(
  status: MaintenanceModeRhythmStatusKind,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "healthy") return "default";
  if (status === "overdue") return "destructive";
  if (status === "due_soon") return "secondary";
  return "outline";
}
