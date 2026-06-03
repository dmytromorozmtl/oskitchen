import { expect, type APIRequestContext } from "@playwright/test";

import {
  PUBLIC_API_SCOPE_FORBIDDEN_MESSAGE,
  PUBLIC_API_SCOPE_FORBIDDEN_STATUS,
  PUBLIC_API_SCOPE_UNAUTHORIZED_STATUS,
  type PublicApiScopeAllowCase,
  type PublicApiScopeDenialCase,
} from "@/lib/api-public/public-api-key-scope-e2e-policy";
import { resolvePublicApiCredential } from "@/lib/api-public/auth";
import { apiKeyHasScope } from "@/lib/api-public/public-api-scopes";
import { guardPublicApiV1Resource, isGuardError } from "@/lib/api-public/guard";

function authRequest(path: string, method: "GET" | "POST", bearerRawKey: string): Request {
  return new Request(`https://example.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${bearerRawKey}` },
  });
}

export async function assertCredentialScopesMatch(
  bearerRawKey: string,
  expectedScopes: readonly string[],
): Promise<void> {
  const credential = await resolvePublicApiCredential(`Bearer ${bearerRawKey}`);
  expect(credential).not.toBeNull();
  expect([...(credential?.scopes ?? [])].sort()).toEqual([...expectedScopes].sort());
}

export async function assertScopeMatrixDenies(
  denialCase: PublicApiScopeDenialCase,
): Promise<void> {
  expect(apiKeyHasScope(denialCase.grantedScopes, denialCase.requiredScope)).toBe(false);
}

export async function assertScopeMatrixAllows(
  allowCase: PublicApiScopeAllowCase,
): Promise<void> {
  expect(apiKeyHasScope(allowCase.grantedScopes, allowCase.requiredScope)).toBe(true);
}

export async function assertGuardDeniesMissingScope(
  denialCase: PublicApiScopeDenialCase,
  bearerRawKey: string,
): Promise<"denied" | "billing_blocked"> {
  const result = await guardPublicApiV1Resource(
    authRequest(denialCase.path, denialCase.method, bearerRawKey),
    denialCase.resourceId,
    denialCase.method,
    `public_api_scope_e2e_${denialCase.id}`,
  );

  if (isGuardError(result) && result.response.status === PUBLIC_API_SCOPE_UNAUTHORIZED_STATUS) {
    return "billing_blocked";
  }

  expect(isGuardError(result)).toBe(true);
  if (!isGuardError(result)) {
    throw new Error(`expected scope denial for ${denialCase.id}`);
  }

  expect(result.response.status).toBe(PUBLIC_API_SCOPE_FORBIDDEN_STATUS);
  const body = (await result.response.json()) as {
    error?: string;
    requiredScope?: string;
  };
  expect(body.error).toBe(PUBLIC_API_SCOPE_FORBIDDEN_MESSAGE);
  expect(body.requiredScope).toBe(denialCase.requiredScope);
  return "denied";
}

export async function assertGuardAllowsGrantedScope(
  allowCase: PublicApiScopeAllowCase,
  bearerRawKey: string,
): Promise<"allowed" | "billing_blocked"> {
  const result = await guardPublicApiV1Resource(
    authRequest(allowCase.path, allowCase.method, bearerRawKey),
    allowCase.resourceId,
    allowCase.method,
    `public_api_scope_e2e_${allowCase.id}`,
  );

  if (isGuardError(result) && result.response.status === PUBLIC_API_SCOPE_UNAUTHORIZED_STATUS) {
    return "billing_blocked";
  }

  expect(isGuardError(result)).toBe(false);
  if (isGuardError(result)) {
    const body = await result.response.json().catch(() => ({}));
    throw new Error(
      `expected scope allow for ${allowCase.id}, got ${result.response.status}: ${JSON.stringify(body)}`,
    );
  }
  expect(result.userId).toBeTruthy();
  return "allowed";
}

export async function assertHttpDeniesMissingScope(
  request: APIRequestContext,
  denialCase: PublicApiScopeDenialCase,
  bearerRawKey: string,
): Promise<"denied" | "billing_blocked"> {
  const response = await request.fetch(denialCase.path, {
    method: denialCase.method,
    headers: { Authorization: `Bearer ${bearerRawKey}` },
    data: denialCase.method === "POST" ? {} : undefined,
  });

  if (response.status() === PUBLIC_API_SCOPE_UNAUTHORIZED_STATUS) {
    return "billing_blocked";
  }

  expect(response.status()).toBe(PUBLIC_API_SCOPE_FORBIDDEN_STATUS);
  const body = (await response.json()) as { error?: string; requiredScope?: string };
  expect(body.error).toBe(PUBLIC_API_SCOPE_FORBIDDEN_MESSAGE);
  expect(body.requiredScope).toBe(denialCase.requiredScope);
  return "denied";
}

export async function assertHttpAllowsGrantedScope(
  request: APIRequestContext,
  allowCase: PublicApiScopeAllowCase,
  bearerRawKey: string,
): Promise<"allowed" | "billing_blocked"> {
  const response = await request.get(allowCase.path, {
    headers: { Authorization: `Bearer ${bearerRawKey}` },
  });

  if (response.status() === PUBLIC_API_SCOPE_UNAUTHORIZED_STATUS) {
    return "billing_blocked";
  }

  expect(response.status()).not.toBe(PUBLIC_API_SCOPE_FORBIDDEN_STATUS);
  expect(response.status()).not.toBe(PUBLIC_API_SCOPE_UNAUTHORIZED_STATUS);
  return "allowed";
}
