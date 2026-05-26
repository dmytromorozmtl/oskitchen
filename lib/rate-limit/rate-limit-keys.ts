import { createHash } from "node:crypto";

export function hashRateLimitKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex").slice(0, 48);
}

export function publicFormRateLimitKey(route: string, ip: string): string {
  return `form:${route}:${ip}`;
}

export function publicApiRateLimitKey(route: string, userId: string, ip: string): string {
  return `api:${route}:${userId}:${ip}`;
}

export function webhookReceiverRateLimitKey(
  provider: string,
  connectionKey: string,
  topic: string,
): string {
  return `wh:${provider}:${connectionKey}:${topic}`;
}
