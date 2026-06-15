import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import {
  parseSlackInteractivePayload,
  verifySlackRequestSignature,
} from "@/lib/storefront/slack-interactive";
import {
  extractSlackInteractiveExternalEventId,
  recordWebhookIngressOrDuplicate,
  WEBHOOK_INGRESS_ROUTE_KEYS,
} from "@/lib/webhooks/webhook-ingress-replay-guard";
import { executeExperimentApprovalAction } from "@/services/storefront/experiment-slack-approval-service";

export async function handleSlackExperimentInteractiveWebhook(
  request: Request,
): Promise<NextResponse> {
  const signingSecret = process.env.SLACK_SIGNING_SECRET?.trim();
  if (!signingSecret) {
    return NextResponse.json({ error: "Slack not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const timestamp = request.headers.get("x-slack-request-timestamp") ?? "";
  const signature = request.headers.get("x-slack-signature");

  if (
    !verifySlackRequestSignature({
      signingSecret,
      timestamp,
      rawBody,
      signature,
    })
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = parseSlackInteractivePayload(rawBody);
  if (!payload?.actions?.length) {
    return NextResponse.json({ ok: true });
  }

  const externalEventId = extractSlackInteractiveExternalEventId(payload);
  if (externalEventId) {
    const replay = await recordWebhookIngressOrDuplicate({
      routeKey: WEBHOOK_INGRESS_ROUTE_KEYS.SLACK_EXPERIMENT_INTERACTIVE,
      externalEventId,
    });
    if (replay.duplicate) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  const action = payload.actions[0];
  const result = await executeExperimentApprovalAction({
    actionId: action.action_id,
    value: action.value,
    responseUrl: payload.response_url,
    slackUser: payload.user?.username ?? payload.user?.id,
  });

  logger.info("slack_experiment_interactive", {
    action_id: action.action_id,
    ok: result.ok,
    detail: result.detail ?? null,
  });

  if (payload.response_url && result.message) {
    void fetch(payload.response_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        replace_original: true,
        text: result.message,
      }),
    });
  }

  return NextResponse.json({ ok: result.ok, detail: result.detail });
}
