import {
  LifecycleEmailSendStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { sendRawEmail } from "@/lib/email";

export const LIFECYCLE_EMAIL_TYPES = [
  "welcome",
  "complete_onboarding",
  "create_first_menu",
  "connect_your_store",
  "trial_ending",
  "activation_congratulations",
  "inactive_reminder",
  "upgrade_suggestion",
] as const;

export type LifecycleEmailType = (typeof LIFECYCLE_EMAIL_TYPES)[number];

/**
 * Creates a pending lifecycle email row and attempts Resend when configured.
 * Never throws to callers.
 */
export async function enqueueLifecycleEmailSafe(
  userId: string,
  emailType: LifecycleEmailType | string,
  subject: string,
  body: string,
): Promise<void> {
  let rowId: string | null = null;
  try {
    const row = await prisma.lifecycleEmail.create({
      data: {
        userId,
        emailType: emailType.slice(0, 80),
        status: LifecycleEmailSendStatus.PENDING,
      },
    });
    rowId = row.id;
  } catch (e) {
    logger.warn("enqueueLifecycleEmail create failed", { userId, emailType, err: e });
    return;
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!profile?.email) {
    await prisma.lifecycleEmail
      .update({
        where: { id: rowId },
        data: { status: LifecycleEmailSendStatus.SKIPPED },
      })
      .catch(() => undefined);
    return;
  }

  const res = await sendRawEmail({
    to: profile.email,
    subject,
    text: body,
  }).catch(() => ({ skipped: true as const }));

  const sent = res && "sent" in res && res.sent;

  await prisma.lifecycleEmail
    .update({
      where: { id: rowId },
      data: {
        status: sent
          ? LifecycleEmailSendStatus.SENT
          : LifecycleEmailSendStatus.FAILED,
        sentAt: sent ? new Date() : null,
      },
    })
    .catch(() => undefined);
}
