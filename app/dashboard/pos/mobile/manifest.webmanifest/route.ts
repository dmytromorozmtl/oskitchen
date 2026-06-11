import { NextResponse } from "next/server";

import { BRAND_ACCENT } from "@/lib/constants";
import { MOBILE_PWA_SCOPE } from "@/lib/pos/pos-mobile-pos-policy";

export async function GET() {
  const manifest = {
    name: "OS Kitchen — Mobile POS",
    short_name: "Mobile POS",
    description: "Phone-as-POS with swipe-to-add products and one-hand cash checkout.",
    start_url: MOBILE_PWA_SCOPE,
    scope: MOBILE_PWA_SCOPE,
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
