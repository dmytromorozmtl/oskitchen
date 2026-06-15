import { logger } from "@/lib/logger";
import { isEmailConfigured, sendRawEmail } from "@/lib/email";

const FOUNDER_TO =
  process.env.GROWTH_NOTIFY_EMAIL ??
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ??
  "";

/** Optional founder inbox ping — skipped when Resend or recipient missing. */
export async function notifyGrowthInbound(subject: string, textBody: string) {
  if (!FOUNDER_TO?.trim()) {
    logger.info("GROWTH_NOTIFY_EMAIL unset — skipping founder notification.");
    return { skipped: true as const };
  }
  if (!isEmailConfigured()) {
    return { skipped: true as const };
  }
  try {
    await sendRawEmail({
      to: FOUNDER_TO.trim(),
      subject: `[OS Kitchen] ${subject}`,
      text: textBody.slice(0, 12000),
    });
    return { ok: true as const };
  } catch (e) {
    logger.warn("notifyGrowthInbound failed", e);
    return { skipped: true as const };
  }
}
