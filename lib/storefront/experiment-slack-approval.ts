import { SITE_URL } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { parseDlqWebhookUrl } from "@/lib/storefront/validate-dlq-webhook-url";

export type ExperimentSlackApprovalPayload = {
  storeSlug: string;
  storefrontId: string;
  liftPp: number;
  approveToken: string;
  rejectToken: string;
};

export type ExperimentSlackRollbackPayload = {
  storeSlug: string;
  zScore: number | null;
  partialToken: string;
  fullToken: string;
  keepToken: string;
};

export type MultiAgentOrchestratorSlackPayload = {
  storeSlug: string;
  storefrontId: string;
  planAction: string;
  rationale: string;
  riskScore: number;
  approveToken: string;
};

function slackWebhookUrl(): string | null {
  const parsed = parseDlqWebhookUrl(process.env.STOREFRONT_EXPERIMENT_APPROVAL_SLACK_WEBHOOK_URL);
  return parsed.ok ? parsed.url : null;
}

/** Post Block Kit approval message (incoming webhook). Interactive buttons use public API URLs. */
export async function sendExperimentSlackApprovalMessage(
  input: ExperimentSlackApprovalPayload,
): Promise<{ sent: boolean }> {
  const url = slackWebhookUrl();
  if (!url) return { sent: false };

  const base = SITE_URL.replace(/\/$/, "");
  const advanced = `${base}/dashboard/storefront/advanced`;

  const body = {
    text: `Experiment auto-conclude ready: ${input.storeSlug} (+${input.liftPp} pp)`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `Approve winner — ${input.storeSlug}` },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Lift:* +${input.liftPp} pp\nAll gates passed. Approve to publish draft theme.`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Approve" },
            style: "primary",
            url: `${base}/api/storefront/experiment/auto-conclude/approve?token=${encodeURIComponent(input.approveToken)}`,
            action_id: "experiment_approve",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Reject" },
            style: "danger",
            url: `${base}/api/storefront/experiment/auto-conclude/reject?token=${encodeURIComponent(input.rejectToken)}`,
            action_id: "experiment_reject",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "View Advanced" },
            url: advanced,
            action_id: "experiment_view_advanced",
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      logger.warn("experiment_slack_approval_failed", { status: res.status, storeSlug: input.storeSlug });
      return { sent: false };
    }
    return { sent: true };
  } catch (e) {
    logger.warn("experiment_slack_approval_error", { error: String(e), storeSlug: input.storeSlug });
    return { sent: false };
  }
}

/** Post-publish regression — partial vs full revert buttons. */
export async function sendExperimentRollbackSlackMessage(
  input: ExperimentSlackRollbackPayload,
): Promise<{ sent: boolean }> {
  const url = slackWebhookUrl();
  if (!url) return { sent: false };

  const base = SITE_URL.replace(/\/$/, "");

  const body = {
    text: `Post-publish regression: ${input.storeSlug} (z=${input.zScore ?? "?"})`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `Regression — ${input.storeSlug}` },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Partial revert* — layout tokens only (colors/layout). *Full revert* — entire published snapshot.\nKeep winner ignores the signal.",
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Partial revert" },
            style: "primary",
            value: input.partialToken,
            action_id: "experiment_partial_revert",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Full revert" },
            style: "danger",
            value: input.fullToken,
            action_id: "experiment_full_revert",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Keep winner" },
            value: input.keepToken,
            action_id: "experiment_rollback_keep",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Advanced" },
            url: `${base}/dashboard/storefront/advanced`,
            action_id: "experiment_view_advanced",
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { sent: res.ok };
  } catch (e) {
    logger.warn("experiment_slack_rollback_error", { error: String(e), storeSlug: input.storeSlug });
    return { sent: false };
  }
}

/** U5 — Multi-agent orchestrator human gate via Slack. */
export async function sendMultiAgentOrchestratorSlackMessage(
  input: MultiAgentOrchestratorSlackPayload,
): Promise<{ sent: boolean }> {
  const url = slackWebhookUrl();
  if (!url) return { sent: false };

  const base = SITE_URL.replace(/\/$/, "");

  const body = {
    text: `Orchestrator plan: ${input.storeSlug} — ${input.planAction}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `Orchestrator approval — ${input.storeSlug}` },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Action:* ${input.planAction}\n*Risk:* ${Math.round(input.riskScore * 100)}%\n*Rationale:* ${input.rationale}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Approve plan" },
            style: "primary",
            url: `${base}/api/storefront/experiment/orchestrator/approve?token=${encodeURIComponent(input.approveToken)}&storefrontId=${encodeURIComponent(input.storefrontId)}`,
            action_id: "orchestrator_approve",
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Advanced" },
            url: `${base}/dashboard/storefront/advanced`,
            action_id: "orchestrator_view_advanced",
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { sent: res.ok };
  } catch (e) {
    logger.warn("orchestrator_slack_error", { error: String(e), storeSlug: input.storeSlug });
    return { sent: false };
  }
}
