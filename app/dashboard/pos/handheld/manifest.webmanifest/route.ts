import { NextResponse } from "next/server";

import { BRAND_ACCENT } from "@/lib/constants";
import { HANDHELD_PWA_SCOPE } from "@/lib/pos/handheld-ordering";

export async function GET() {
  const manifest = {
    name: "OS Kitchen — Handheld Waiter",
    short_name: "Waiter POS",
    description: "Mobile-first tableside ordering with offline cash checkout for OS Kitchen.",
    start_url: HANDHELD_PWA_SCOPE,
    scope: HANDHELD_PWA_SCOPE,
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: BRAND_ACCENT,
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/favicon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
