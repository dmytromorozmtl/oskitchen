import { SITE_URL } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { fireInternalAlert } from "@/services/notifications/alert-service";
import { emitOpsSignal } from "@/services/observability/ops-signals";
import type { ProductionCronSlug } from "@/services/cron/production-manifest";

export type CronEscalationPagingPhase =
  | "auto_escalated"
  | "auto_rerouted"
  | "auto_reminded";

export type CronEscalationPagingRecipient = {
  userId: string;
  email: string;
  fullName: string;
} | null;

export async function pageCronEscalationEvent(params: {
  slug: ProductionCronSlug;
  incidentMarker: string;
  phase: CronEscalationPagingPhase;
  ticketId: string;
  ticketRef: string | null;
  ticketSubject: string;
  recipient: CronEscalationPagingRecipient;
  reason: string;
}): Promise<void> {
  const opsKind = params.phase === "auto_escalated" ? "cron_escalation" : "cron_escalation_follow_up";
  emitOpsSignal(opsKind, {
    slug: params.slug,
    incidentMarker: params.incidentMarker,
    phase: params.phase,
    ticketId: params.ticketId,
    ticketRef: params.ticketRef ?? null,
    recipientEmail: params.recipient?.email ?? null,
  });

  if (!params.recipient) {
    return;
  }

  const link = `${SITE_URL}/dashboard/support/${params.ticketId}`;
  try {
    await fireInternalAlert({
      userId: params.recipient.userId,
      templateKey: "internal_cron_escalation",
      triggerType:
        params.phase === "auto_escalated"
          ? "CRON_AUTO_ESCALATED"
          : params.phase === "auto_rerouted"
            ? "CRON_AUTO_REROUTED"
            : "CRON_AUTO_REMINDED",
      sourceType: "CRON_EXECUTION_INCIDENT",
      sourceId: `${params.slug}:${params.incidentMarker}:${params.phase}`,
      reason: `${params.ticketSubject} (${params.ticketRef ?? params.ticketId}) — ${params.reason}`,
      link,
      recipientEmail: params.recipient.email,
      recipientUserId: params.recipient.userId,
      category: "INTERNAL_ALERT",
    });
  } catch (error) {
    logger.warn("cron_escalation_internal_alert_failed", {
      slug: params.slug,
      incidentMarker: params.incidentMarker,
      phase: params.phase,
      recipientEmail: params.recipient.email,
      message: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
