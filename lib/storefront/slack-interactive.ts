import { createHmac, timingSafeEqual } from "node:crypto";

export function verifySlackRequestSignature(input: {
  signingSecret: string;
  timestamp: string;
  rawBody: string;
  signature: string | null;
}): boolean {
  const ts = input.timestamp.trim();
  const sig = input.signature?.trim();
  if (!ts || !sig || !sig.startsWith("v0=")) return false;

  const ageSec = Math.abs(Date.now() / 1000 - Number(ts));
  if (!Number.isFinite(ageSec) || ageSec > 60 * 5) return false;

  const base = `v0:${ts}:${input.rawBody}`;
  const digest = `v0=${createHmac("sha256", input.signingSecret).update(base).digest("hex")}`;

  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(sig));
  } catch {
    return false;
  }
}

export function parseSlackInteractivePayload(rawBody: string): {
  type: string;
  user?: { id: string; username?: string };
  actions?: { action_id: string; value: string }[];
  response_url?: string;
} | null {
  try {
    const params = new URLSearchParams(rawBody);
    const payload = params.get("payload");
    if (!payload) return null;
    return JSON.parse(payload) as {
      type: string;
      user?: { id: string; username?: string };
      actions?: { action_id: string; value: string }[];
      response_url?: string;
    };
  } catch {
    return null;
  }
}
