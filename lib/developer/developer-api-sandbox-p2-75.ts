import {
  DEVELOPER_API_PRODUCTION_KEY_PREFIX,
  DEVELOPER_API_SANDBOX_KEY_PREFIX,
} from "@/lib/developer/developer-api-rate-limits-p2-75-policy";
import { RATE_LIMIT_POLICIES } from "@/lib/rate-limit/rate-limit-policies";

export type ApiKeyEnvironment = "production" | "sandbox";

export function isSandboxDeveloperApiKey(raw: string): boolean {
  return raw.startsWith(DEVELOPER_API_SANDBOX_KEY_PREFIX);
}

export function resolveApiKeyEnvironment(raw: string): ApiKeyEnvironment {
  return isSandboxDeveloperApiKey(raw) ? "sandbox" : "production";
}

export function generateDeveloperApiKeySecret(environment: ApiKeyEnvironment): string {
  const suffix = cryptoRandomBase64Url(environment === "sandbox" ? 20 : 24);
  return environment === "sandbox"
    ? `${DEVELOPER_API_SANDBOX_KEY_PREFIX}${suffix}`
    : `${DEVELOPER_API_PRODUCTION_KEY_PREFIX}${suffix}`;
}

function cryptoRandomBase64Url(length: number): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Buffer.from(bytes).toString("base64url");
}

export const DEVELOPER_API_SANDBOX_BASE_URL =
  process.env.DEVELOPER_API_SANDBOX_BASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "https://staging.os-kitchen.com";

export const DEVELOPER_API_SANDBOX_OPENAPI_URL = `${DEVELOPER_API_SANDBOX_BASE_URL}/api/openapi.json`;

export function sandboxBurstMax(): number {
  return RATE_LIMIT_POLICIES.public_api_sandbox_key_burst.max;
}

export function productionBurstMax(): number {
  return RATE_LIMIT_POLICIES.public_api_key_burst.max;
}

export function resolveBurstPolicyForApiKey(raw: string): "public_api_key_burst" | "public_api_sandbox_key_burst" {
  return isSandboxDeveloperApiKey(raw)
    ? "public_api_sandbox_key_burst"
    : "public_api_key_burst";
}
