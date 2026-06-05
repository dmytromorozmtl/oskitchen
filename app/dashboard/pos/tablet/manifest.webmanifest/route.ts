import { NextResponse } from "next/server";

import { BRAND_ACCENT } from "@/lib/constants";
import { TABLET_PWA_SCOPE } from "@/lib/pos/pos-tablet-pos-policy";

export async function GET() {
  const manifest = {
    name: "OS Kitchen — Tablet POS",
    short_name: "Tablet POS",
    description: "iPad and Android counter POS with 44px touch targets and portrait/landscape layouts.",
    start_url: TABLET_PWA_SCOPE,
    scope: TABLET_PWA_SCOPE,
    display: "standalone",
    orientation: "any",
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
