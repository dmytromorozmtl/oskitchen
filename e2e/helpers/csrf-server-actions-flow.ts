import { expect, type APIRequestContext } from "@playwright/test";

import {
  CSRF_E2E_FOREIGN_ORIGIN,
  CSRF_ORIGIN_FORBIDDEN_MESSAGES,
  CSRF_ORIGIN_FORBIDDEN_STATUS,
  type CsrfMutationHttpMethod,
} from "@/lib/security/csrf-server-actions-e2e-policy";
import { rejectCrossSiteMutation } from "@/lib/security/mutation-origin-guard";

export async function assertMutationOriginGuardBlocksForeignOrigin(
  path: string,
  method: CsrfMutationHttpMethod,
  foreignOrigin: string = CSRF_E2E_FOREIGN_ORIGIN,
): Promise<void> {
  const response = rejectCrossSiteMutation(
    new Request(`https://app.kitchenos.test${path}`, {
      method,
      headers: { Origin: foreignOrigin },
    }),
  );

  expect(response).not.toBeNull();
  expect(response?.status).toBe(CSRF_ORIGIN_FORBIDDEN_STATUS);
  const body = (await response!.json()) as { error?: string };
  expect(body.error).toBe(CSRF_ORIGIN_FORBIDDEN_MESSAGES.forbiddenOrigin);
}

export async function assertMutationOriginGuardAllowsTrustedOrigin(
  path: string,
  method: CsrfMutationHttpMethod,
  trustedOrigin: string,
): Promise<void> {
  const response = rejectCrossSiteMutation(
    new Request(`https://app.kitchenos.test${path}`, {
      method,
      headers: { Origin: trustedOrigin },
    }),
  );

  expect(response).toBeNull();
}

export async function assertMutationOriginGuardIgnoresSafeMethods(path: string): Promise<void> {
  const response = rejectCrossSiteMutation(
    new Request(`https://app.kitchenos.test${path}`, {
      method: "GET",
      headers: { Origin: CSRF_E2E_FOREIGN_ORIGIN },
    }),
  );

  expect(response).toBeNull();
}

export async function assertHttpBlocksForeignOriginOnProtectedRoute(
  request: APIRequestContext,
  path: string,
  foreignOrigin: string = CSRF_E2E_FOREIGN_ORIGIN,
): Promise<void> {
  const response = await request.post(path, {
    headers: {
      Origin: foreignOrigin,
      "Content-Type": "application/json",
    },
    data: { userId: "00000000-0000-4000-8000-000000000001" },
  });

  expect(response.status()).toBe(CSRF_ORIGIN_FORBIDDEN_STATUS);
  const body = (await response.json()) as { error?: string };
  expect(body.error).toBe(CSRF_ORIGIN_FORBIDDEN_MESSAGES.forbiddenOrigin);
}

export async function assertHttpAllowsTrustedOriginPastCsrfGate(
  request: APIRequestContext,
  path: string,
  trustedOrigin: string,
): Promise<"passed_csrf" | "blocked_csrf"> {
  const response = await request.post(path, {
    headers: {
      Origin: trustedOrigin,
      "Content-Type": "application/json",
    },
    data: { userId: "00000000-0000-4000-8000-000000000001" },
  });

  if (response.status() === CSRF_ORIGIN_FORBIDDEN_STATUS) {
    return "blocked_csrf";
  }

  expect(response.status()).not.toBe(CSRF_ORIGIN_FORBIDDEN_STATUS);
  return "passed_csrf";
}
