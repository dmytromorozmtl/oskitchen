import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateCustomCss } from "@/lib/storefront/validate-custom-css";
import { saveStorefrontCustomCss } from "@/services/storefront/storefront-theme-customizer-service";

const bodySchema = z.object({
  storefrontId: z.string().uuid(),
  customCss: z.string().max(32_000),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const owned = await prisma.storefrontSettings.findFirst({
    where: { id: parsed.data.storefrontId, userId: user.id },
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cssCheck = validateCustomCss(parsed.data.customCss);
  if (!cssCheck.valid) {
    return NextResponse.json({ error: cssCheck.error ?? "Invalid CSS" }, { status: 400 });
  }

  const res = await saveStorefrontCustomCss({
    storefrontId: parsed.data.storefrontId,
    userId: user.id,
    customCss: parsed.data.customCss,
  });

  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
