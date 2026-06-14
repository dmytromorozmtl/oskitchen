/**
 * SMS notifications via Twilio when configured.
 * Set SMS_NOTIFICATIONS_ENABLED=true and TWILIO_* env vars.
 */

export type SmsSendResult =
  | { ok: true; sid: string }
  | { ok: false; error: string; skipped?: boolean };

export function isSmsNotificationsEnabled(): boolean {
  return (
    process.env.SMS_NOTIFICATIONS_ENABLED === "true" &&
    Boolean(process.env.TWILIO_ACCOUNT_SID?.trim()) &&
    Boolean(process.env.TWILIO_AUTH_TOKEN?.trim()) &&
    Boolean(process.env.TWILIO_FROM_NUMBER?.trim())
  );
}

export async function sendSmsNotification(params: {
  to: string;
  body: string;
}): Promise<SmsSendResult> {
  if (!isSmsNotificationsEnabled()) {
    return { ok: false, error: "SMS notifications are not enabled.", skipped: true };
  }

  const to = params.to.trim();
  if (!to) {
    return { ok: false, error: "Missing destination phone number." };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN!.trim();
  const from = process.env.TWILIO_FROM_NUMBER!.trim();

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const form = new URLSearchParams({ To: to, From: from, Body: params.body.slice(0, 1600) });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
    const json = (await res.json().catch(() => ({}))) as { sid?: string; message?: string };
    if (!res.ok) {
      return { ok: false, error: json.message ?? `Twilio error ${res.status}` };
    }
    return { ok: true, sid: json.sid ?? "unknown" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
