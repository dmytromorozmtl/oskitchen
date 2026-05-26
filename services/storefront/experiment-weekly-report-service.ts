import { APP_NAME, SITE_URL } from "@/lib/constants";
import { toJsonValue } from "@/lib/prisma/json";
import { buildExperimentSeriesCsv } from "@/lib/storefront/experiment-csv-export";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import { getExperimentConcludedAt } from "@/lib/storefront/theme-experiment-cooldown";
import { isEmailConfigured, sendRawEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import {
  getThemeExperimentArmMetrics,
  getThemeExperimentDailySeries,
} from "@/services/storefront/theme-experiment-analytics-service";
import { evaluateExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";

const REPORT_DAYS = [7, 14, 30] as const;

async function buildReportAttachment(storefrontId: string, storeSlug: string, days: number) {
  const series = await getThemeExperimentDailySeries(storefrontId, days);
  const csv = buildExperimentSeriesCsv(series);
  return {
    filename: `experiment-${storeSlug}-${days}d.csv`,
    content: Buffer.from(csv, "utf-8").toString("base64"),
  };
}

export async function sendWeeklyExperimentReports(): Promise<{
  sent: number;
  skipped: number;
  errors: number;
}> {
  if (!isEmailConfigured()) {
    logger.warn("experiment_weekly_report_skipped", { reason: "email_not_configured" });
    return { sent: 0, skipped: 0, errors: 0 };
  }

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: {
      id: true,
      storeSlug: true,
      publicName: true,
      themeExperimentJson: true,
      userId: true,
    },
  });

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const sf of storefronts) {
    const exp = parseThemeExperimentConfig(sf.themeExperimentJson);
    const concludedAt = getExperimentConcludedAt(sf.themeExperimentJson);
    const active = exp?.enabled === true;
    const recentConclude =
      concludedAt && Date.now() - new Date(concludedAt).getTime() < 30 * 24 * 60 * 60 * 1000;

    if (!active && !recentConclude) {
      skipped++;
      continue;
    }

    const profile = await prisma.userProfile.findUnique({
      where: { id: sf.userId },
      select: { email: true },
    });
    const to = profile?.email?.trim();
    if (!to) {
      skipped++;
      continue;
    }

    try {
      const attachments = await Promise.all(
        REPORT_DAYS.map((d) => buildReportAttachment(sf.id, sf.storeSlug, d)),
      );
      const arm7 = await getThemeExperimentArmMetrics(sf.id, 7);
      const decision = evaluateExperimentProdDecision(arm7);

      const html = `
        <p>Weekly experiment archive for <strong>${sf.publicName}</strong> (${sf.storeSlug}).</p>
        <p>7d recommendation: <strong>${decision.recommendation.replace(/_/g, " ")}</strong> — ${decision.headline}</p>
        <p>Attached: CSV exports for 7, 14, and 30 days. Compare with GA4 using the same ranges.</p>
        <p><a href="${SITE_URL}/dashboard/storefront/advanced">Open Advanced dashboard</a></p>
      `;

      await sendRawEmail({
        to,
        subject: `${APP_NAME} — experiment CSV archive (${sf.storeSlug})`,
        html,
        attachments: attachments.map((a) => ({
          filename: a.filename,
          content: a.content,
        })),
      });
      sent++;
    } catch (e) {
      errors++;
      logger.warn("experiment_weekly_report_failed", {
        storeSlug: sf.storeSlug,
        error: String(e),
      });
    }
  }

  return { sent, skipped, errors };
}
