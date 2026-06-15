import { NextResponse } from "next/server";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function allowedOrigins(): string[] {
  const origins = new Set<string>();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    try {
      origins.add(new URL(appUrl).origin);
    } catch {
      /* ignore */
    }
  }
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    origins.add(`https://${vercel}`);
  }
  return [...origins];
}

/**
 * Cookie-session API routes: reject cross-site mutations when Origin/Referer present.
 * Webhook and cron routes should skip this (Bearer / provider signatures).
 */
export function rejectCrossSiteMutation(request: Request): NextResponse | null {
  if (!MUTATION_METHODS.has(request.method.toUpperCase())) return null;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  if (!origin && !referer) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Origin required" }, { status: 403 });
    }
    return null;
  }

  const allowed = allowedOrigins();
  const candidate = origin ?? (referer ? safeOriginFromReferer(referer) : null);
  if (!candidate) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (!allowed.includes(candidate)) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }
  return null;
}

function safeOriginFromReferer(referer: string): string | null {
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}
