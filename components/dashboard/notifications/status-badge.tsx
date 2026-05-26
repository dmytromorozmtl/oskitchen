import { Badge } from "@/components/ui/badge";
import {
  NOTIFICATION_STATUS_LABEL,
  type NotificationStatusKey,
  statusTone,
} from "@/lib/notifications/notification-status";
import {
  PROVIDER_MODE_LABEL,
  type ProviderMode,
} from "@/lib/notifications/notification-types";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<string, string> = {
  neutral: "bg-muted text-foreground",
  info: "bg-sky-500/15 text-sky-900 dark:text-sky-200",
  success: "bg-emerald-500/15 text-emerald-900 dark:text-emerald-200",
  warning: "bg-amber-500/15 text-amber-900 dark:text-amber-200",
  danger: "bg-rose-500/15 text-rose-900 dark:text-rose-200",
};

export function NotificationStatusBadge({ status }: { status: NotificationStatusKey }) {
  return (
    <Badge variant="outline" className={cn("text-[10px]", TONE_CLASS[statusTone(status)])}>
      {NOTIFICATION_STATUS_LABEL[status]}
    </Badge>
  );
}

const PROVIDER_TONE: Record<ProviderMode, string> = {
  RESEND: "success",
  DEVELOPMENT_LOG_ONLY: "info",
  MANUAL_PREVIEW: "warning",
  DISABLED: "danger",
};

export function ProviderModeBadge({ mode }: { mode: ProviderMode }) {
  return (
    <Badge variant="outline" className={cn("text-[10px]", TONE_CLASS[PROVIDER_TONE[mode]])}>
      {PROVIDER_MODE_LABEL[mode]}
    </Badge>
  );
}
