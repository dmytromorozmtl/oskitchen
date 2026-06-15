import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveThemeCustomizer } from "@/services/storefront/storefront-theme-customizer-service";

const bodySchema = z.object({
  storefrontId: z.string().uuid(),
  theme: z.object({
    accentColor: z.string().max(32),
    secondaryColor: z.string().max(32),
    fontFamily: z.string().max(120),
    borderRadius: z.string().max(32),
    buttonStyle: z.enum(["rounded-full", "rounded-lg", "rounded-none"]),
    heroLayout: z.enum(["centered", "split", "image-first"]),
    cardStyle: z.enum(["shadow-sm", "shadow-md", "bordered"]),
    navStyle: z.enum(["sticky", "static"]),
  }),
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

  const res = await saveThemeCustomizer({
    storefrontId: parsed.data.storefrontId,
    userId: user.id,
    customizer: parsed.data.theme,
  });

  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
