import {
  RATE_LIMIT_EXCEEDED_USER_MESSAGE,
  RATE_LIMIT_REQUIRED_HEADERS,
  isRateLimitExceededStatus,
} from "@/lib/testing/rate-limit-response-policy";

export type RateLimitResponseAudit = {
  ok: boolean;
  failures: string[];
};

export function auditRateLimitHeaders(
  headers: Headers | Record<string, string>,
): RateLimitResponseAudit {
  const failures: string[] = [];
  const get = (name: string): string | null => {
    if (headers instanceof Headers) {
      return headers.get(name);
    }
    return headers[name] ?? headers[name.toLowerCase()] ?? null;
  };

  for (const name of RATE_LIMIT_REQUIRED_HEADERS) {
    const value = get(name);
    if (!value?.trim()) {
      failures.push(`missing ${name} header`);
    }
  }

  const retryAfter = get("Retry-After");
  if (retryAfter != null) {
    const seconds = Number(retryAfter);
    if (!Number.isFinite(seconds) || seconds < 1) {
      failures.push("Retry-After must be a positive integer (seconds)");
    }
  }

  const remaining = get("X-RateLimit-Remaining");
  if (remaining != null && remaining !== "0") {
    failures.push("X-RateLimit-Remaining should be 0 when limited");
  }

  return { ok: failures.length === 0, failures };
}

export function auditRateLimitJsonBody(body: unknown): RateLimitResponseAudit {
  const failures: string[] = [];

  if (typeof body !== "object" || body === null) {
    return { ok: false, failures: ["body must be JSON object"] };
  }

  const error = (body as { error?: unknown }).error;
  if (typeof error !== "string" || !error.trim()) {
    failures.push("missing string error field");
  } else if (error.length < 10) {
    failures.push("error message too short to be user-friendly");
  }

  return { ok: failures.length === 0, failures };
}

export async function auditRateLimitResponse(
  response: Response,
  expectedMessage?: string,
): Promise<RateLimitResponseAudit> {
  const failures: string[] = [];

  if (!isRateLimitExceededStatus(response.status)) {
    failures.push(`expected status 429, got ${response.status}`);
  }

  const headerAudit = auditRateLimitHeaders(response.headers);
  failures.push(...headerAudit.failures);

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    failures.push("response body is not valid JSON");
    return { ok: false, failures };
  }

  const bodyAudit = auditRateLimitJsonBody(body);
  failures.push(...bodyAudit.failures);

  if (expectedMessage && typeof body === "object" && body !== null) {
    const error = (body as { error?: string }).error;
    if (error !== expectedMessage) {
      failures.push(`expected error message "${expectedMessage}", got "${error ?? ""}"`);
    }
  }

  return { ok: failures.length === 0, failures };
}

export function limitedEnforceResult(retryAfterMs = 4_000): {
  ok: false;
  retryAfterMs: number;
  reason: "limited";
  snapshot: { limit: number; remaining: number; resetAt: number };
  headers: Record<string, string>;
} {
  return {
    ok: false,
    retryAfterMs,
    reason: "limited",
    snapshot: { limit: 120, remaining: 0, resetAt: 1_700_000_060 },
    headers: {
      "X-RateLimit-Limit": "120",
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": "1700000060",
      "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
    },
  };
}
