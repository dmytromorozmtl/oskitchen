import { createHmac } from "node:crypto";

import { NextResponse } from "next/server";

import { timingSafeEqualText } from "@/lib/security/timing-safe";

export type ConfiguredSecretResult =
  | { ok: true; secret: string }
  | { ok: false; response: NextResponse };

export function requireConfiguredWebhookSecret(
  secretValue: string | null | undefined,
  options?: {
    missingMessage?: string;
  },
): ConfiguredSecretResult {
  const secret = secretValue?.trim();
  if (!secret) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: options?.missingMessage ?? "Webhook not configured" },
        { status: 503 },
      ),
    };
  }

  return { ok: true, secret };
}

function readBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, ...tokenParts] = authHeader.trim().split(/\s+/);
  if (scheme.toLowerCase() !== "bearer" || tokenParts.length === 0) {
    return null;
  }
  const token = tokenParts.join(" ").trim();
  return token.length > 0 ? token : null;
}

export function requireBearerWebhookSecret(
  request: Request,
  options: {
    secret: string | null | undefined;
    missingMessage?: string;
    unauthorizedMessage?: string;
  },
): NextResponse | null {
  const configured = requireConfiguredWebhookSecret(options.secret, {
    missingMessage: options.missingMessage,
  });
  if (!configured.ok) {
    return configured.response;
  }

  const token = readBearerToken(request.headers.get("authorization"));
  if (!token || !timingSafeEqualText(token, configured.secret)) {
    return NextResponse.json(
      { error: options.unauthorizedMessage ?? "Unauthorized" },
      { status: 401 },
    );
  }

  return null;
}

export function verifyResendWebhookSignature(
  rawBody: string,
  header: string | null,
  secret: string,
): boolean {
  if (!header) return false;

  const parts = header.split(",").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) {
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {});

  const timestamp = parts.t ?? parts.timestamp;
  const signature = parts.v1 ?? parts.signature;
  if (!timestamp || !signature) return false;

  const payload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return timingSafeEqualText(signature, expected);
}
