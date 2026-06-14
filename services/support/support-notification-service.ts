import { logger } from "@/lib/logger";
import { isEmailConfigured, sendRawEmail } from "@/lib/email";

/** Sends real email only when provider is configured — never fabricates delivery. */
export async function trySendTicketCreatedConfirmation(params: {
  to: string;
  ticketRef: string;
  subjectLine: string;
}) {
  if (!isEmailConfigured()) {
    logger.info("Support ticket confirmation skipped — email provider not configured.");
    return { skipped: true as const, reason: "email_not_configured" as const };
  }
  try {
    await sendRawEmail({
      to: params.to,
      subject: `[OS Kitchen] Ticket ${params.ticketRef}: ${params.subjectLine}`,
      text: `We received your request (${params.ticketRef}). Our team will respond based on your issue priority.\n\nThis message was sent because outbound email is configured for this environment.`,
    });
    return { ok: true as const };
  } catch (e) {
    logger.warn("Support ticket confirmation email failed", e);
    return { skipped: true as const, reason: "send_failed" as const };
  }
}
