import { Prisma } from "@prisma/client";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

/** When `outreach_campaigns` migration is not applied yet — avoid crashing Growth pages. */
function isMissingOutreachTable(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code === "P2021") return true;
  const msg = error.message ?? "";
  return msg.includes("outreach_campaigns") && msg.includes("does not exist");
}

export async function listOutreachCampaigns(take = 50) {
  try {
    return await prisma.outreachCampaign.findMany({
      orderBy: { createdAt: "desc" },
      take,
    });
  } catch (e) {
    if (isMissingOutreachTable(e)) {
      logger.warn("outreach_campaigns table missing — run prisma migrate deploy");
      return [];
    }
    throw e;
  }
}

export async function seedStarterCampaignIfEmpty() {
  try {
    const n = await prisma.outreachCampaign.count();
    if (n > 0) return;
    await prisma.outreachCampaign.create({
      data: {
        name: "Founder outbound — beta follow-up",
        channel: "email",
        audience: "Hot beta leads",
        status: "DRAFT",
        metricsJson: { opens: 0, replies: 0 },
      },
    });
  } catch (e) {
    if (isMissingOutreachTable(e)) {
      logger.warn("outreach_campaigns table missing — skip seed; run prisma migrate deploy");
      return;
    }
    throw e;
  }
}
