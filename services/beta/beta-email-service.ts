import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { isEmailConfigured, sendRawEmail } from "@/lib/email";
import { APP_NAME } from "@/lib/constants";
import { logger } from "@/lib/logger";

function token(): string {
  return randomBytes(32).toString("hex");
}

export function betaApprovalEmailText(params: {
  contactName: string;
  businessName: string;
  cohortName?: string | null;
}): { subject: string; text: string } {
  const cohort = params.cohortName ? `\nCohort: ${params.cohortName}` : "";
  return {
    subject: `${APP_NAME} beta — you’re approved`,
    text: `Hi ${params.contactName},\n\nThanks for applying on behalf of ${params.businessName}. You’re approved for the OS Kitchen early-access program.${cohort}\n\nNext: our team will send onboarding steps and calendar options shortly.\n\n— OS Kitchen founders`,
  };
}

export function betaWaitlistEmailText(params: {
  contactName: string;
  businessName: string;
}): { subject: string; text: string } {
  return {
    subject: `${APP_NAME} beta — you’re on the waitlist`,
    text: `Hi ${params.contactName},\n\nWe received your application for ${params.businessName}. Demand is high; you’re officially waitlisted and we’ll reach out as capacity opens.\n\n— OS Kitchen founders`,
  };
}

export async function sendBetaApplicantEmail(to: string, subject: string, text: string) {
  if (!isEmailConfigured()) {
    logger.info("Resend not configured — skipping beta applicant email.");
    return { skipped: true as const };
  }
  try {
    await sendRawEmail({ to, subject, text });
    return { sent: true as const };
  } catch (e) {
    logger.warn("sendBetaApplicantEmail failed", e);
    return { skipped: true as const };
  }
}

export async function createInvitationRecord(betaLeadId: string, cohortId?: string | null) {
  return prisma.betaInvitation.create({
    data: {
      betaLeadId,
      cohortId: cohortId ?? null,
      inviteToken: token(),
      sentAt: new Date(),
    },
  });
}
