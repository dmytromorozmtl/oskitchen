import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { THEME_EXPERIMENT_VISITOR_COOKIE } from "@/lib/storefront/theme-experiment-bucket";
import {
  resolveThemeExperimentArm,
  parseThemeExperimentConfig,
  THEME_EXPERIMENT_COOKIE,
  type ThemeExperimentArm,
} from "@/lib/storefront/theme-experiment";
import { enforceStorefrontRouteRateLimit } from "@/lib/storefront/storefront-rate-limit";

const schema = z.object({ storeSlug: z.string().min(2).max(120) });

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function setArmCookie(res: NextResponse, arm: ThemeExperimentArm) {
  res.cookies.set(THEME_EXPERIMENT_COOKIE, arm, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: false,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const rate = await enforceStorefrontRouteRateLimit(request, "theme-experiment", parsed.data.storeSlug);
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug: parsed.data.storeSlug, enabled: true, published: true },
    select: { id: true, themeExperimentJson: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "Storefront not found." }, { status: 404 });
  }

  const config = parseThemeExperimentConfig(sf.themeExperimentJson);
  const cookieHeader = request.headers.get("cookie") ?? "";
  const existing = cookieHeader.match(/(?:^|;\s*)kos_ab_theme=([^;]+)/)?.[1];
  const visitorId =
    cookieHeader.match(/(?:^|;\s*)kos_ab_vid=([^;]+)/)?.[1] ?? crypto.randomUUID();
  const resolved = resolveThemeExperimentArm({
    config,
    cookieValue: existing,
    visitorId,
  });

  const res = NextResponse.json({ ok: true, arm: resolved.arm });
  if (resolved.setCookie) {
    setArmCookie(res, resolved.setCookie);
    if (!cookieHeader.includes("kos_ab_vid=")) {
      res.cookies.set(THEME_EXPERIMENT_VISITOR_COOKIE, visitorId, {
        path: "/",
        maxAge: COOKIE_MAX_AGE * 12,
        sameSite: "lax",
        httpOnly: false,
      });
    }
  }
  return res;
}
