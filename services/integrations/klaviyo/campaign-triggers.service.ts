import type { KlaviyoCampaignTriggerResult } from "@/lib/integrations/klaviyo-live-types";
import {
  fetchKlaviyoSegmentProfileEmails,
  verifyKlaviyoApiKey,
} from "@/services/integrations/klaviyo/klaviyo-api";
import { getKlaviyoApiKey } from "@/services/integrations/klaviyo/klaviyo-credentials";
import {
  triggerKlaviyoFlow,
  type EmailFlowId,
} from "@/services/marketing/email-marketing-service";

const VALID_FLOWS: EmailFlowId[] = [
  "welcome",
  "abandoned_cart",
  "post_purchase",
  "win_back",
];

export function isValidKlaviyoCampaignFlow(flow: string): flow is EmailFlowId {
  return (VALID_FLOWS as string[]).includes(flow);
}

export async function triggerKlaviyoCampaignBatch(input: {
  flow: EmailFlowId;
  emails: string[];
}): Promise<KlaviyoCampaignTriggerResult> {
  const apiKey = getKlaviyoApiKey();
  if (!apiKey) {
    return { ok: false, triggered: 0, failed: 0, message: "Set KLAVIYO_API_KEY" };
  }

  const verified = await verifyKlaviyoApiKey(apiKey);
  if (!verified.ok) {
    return { ok: false, triggered: 0, failed: 0, message: verified.error };
  }

  const unique = [...new Set(input.emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  if (!unique.length) {
    return { ok: false, triggered: 0, failed: 0, message: "No recipient emails provided." };
  }

  let triggered = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const email of unique) {
    const result = await triggerKlaviyoFlow(input.flow, email);
    if (result.ok) {
      triggered += 1;
    } else {
      failed += 1;
      if (errors.length < 5) errors.push(`${email}: ${result.error}`);
    }
  }

  return {
    ok: failed === 0,
    triggered,
    failed,
    message: `Triggered ${triggered} campaign events (${failed} failed)`,
    errors: errors.length ? errors : undefined,
  };
}

export async function triggerKlaviyoCampaignForSegment(input: {
  flow: EmailFlowId;
  segmentId: string;
  limit?: number;
}): Promise<KlaviyoCampaignTriggerResult> {
  const apiKey = getKlaviyoApiKey();
  if (!apiKey) {
    return { ok: false, triggered: 0, failed: 0, message: "Set KLAVIYO_API_KEY" };
  }

  const emails = await fetchKlaviyoSegmentProfileEmails(
    apiKey,
    input.segmentId,
    input.limit ?? 500,
  );
  if (!emails.length) {
    return {
      ok: false,
      triggered: 0,
      failed: 0,
      message: "Segment has no exportable profile emails.",
    };
  }

  return triggerKlaviyoCampaignBatch({ flow: input.flow, emails });
}
