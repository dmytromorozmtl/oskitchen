import type { MailchimpCampaignAutomationResult } from "@/lib/integrations/mailchimp-live-types";
import {
  fetchMailchimpAutomations,
  fetchMailchimpListMemberEmails,
  queueMailchimpAutomationEmail,
} from "@/services/integrations/mailchimp/mailchimp-api";
import { getMailchimpCredentials } from "@/services/integrations/mailchimp/mailchimp-credentials";
import { ensureMailchimpConnection } from "@/services/integrations/mailchimp/mailchimp-live-service";

export async function listMailchimpCampaignAutomations(userId: string) {
  const conn = await ensureMailchimpConnection(userId);
  const creds = getMailchimpCredentials(conn);
  if (!creds?.accessToken || !creds.apiEndpoint) {
    return { ok: false as const, error: "Connect Mailchimp via OAuth first." };
  }

  const automations = await fetchMailchimpAutomations(creds.apiEndpoint, creds.accessToken);
  return { ok: true as const, automations };
}

export async function triggerMailchimpCampaignAutomation(input: {
  userId: string;
  automationId: string;
  listId?: string;
  limit?: number;
}): Promise<MailchimpCampaignAutomationResult> {
  const conn = await ensureMailchimpConnection(input.userId);
  const creds = getMailchimpCredentials(conn);
  if (!creds?.accessToken || !creds.apiEndpoint) {
    return { ok: false, triggered: 0, failed: 0, message: "Connect Mailchimp via OAuth first." };
  }

  const automations = await fetchMailchimpAutomations(creds.apiEndpoint, creds.accessToken);
  const automation = automations.find((row) => row.id === input.automationId);
  if (!automation?.emailId) {
    return { ok: false, triggered: 0, failed: 0, message: "Automation not found or has no email step." };
  }

  const listId = input.listId?.trim() || automation.listId || creds.listId;
  if (!listId) {
    return { ok: false, triggered: 0, failed: 0, message: "Mailchimp list id is required." };
  }

  const emails = await fetchMailchimpListMemberEmails(
    creds.apiEndpoint,
    creds.accessToken,
    listId,
    input.limit ?? 200,
  );

  if (!emails.length) {
    return {
      ok: false,
      triggered: 0,
      failed: 0,
      message: "No list members available to queue for automation.",
    };
  }

  let triggered = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const email of emails) {
    const result = await queueMailchimpAutomationEmail({
      apiEndpoint: creds.apiEndpoint,
      accessToken: creds.accessToken,
      workflowId: automation.id,
      workflowEmailId: automation.emailId,
      email,
    });
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
    message: `Queued ${triggered} members for automation (${failed} failed)`,
    errors: errors.length ? errors : undefined,
  };
}
