import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { listStorefrontThemeVersions } from "@/services/storefront/storefront-theme-version-service";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const storefrontId = new URL(request.url).searchParams.get("storefrontId") ?? "";
  const parsed = z.string().uuid().safeParse(storefrontId);
  if (!parsed.success) return NextResponse.json({ error: "Invalid storefrontId" }, { status: 400 });

  const versions = await listStorefrontThemeVersions(parsed.data, user.id);
  if (!versions) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    versions: versions.map((v) => ({
      id: v.id,
      createdAt: v.createdAt.toISOString(),
    })),
  });
}

export async function POST() {
  return NextResponse.json({ error: "Use GET with ?storefrontId=" }, { status: 405 });
}
