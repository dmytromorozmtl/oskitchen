import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";

import { SkipToContent } from "@/components/a11y/skip-to-content";
import { CookieConsentBanner } from "@/components/analytics/cookie-consent";
import { GoogleAdsTracking } from "@/components/analytics/google-ads";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { LinkedInInsightTag } from "@/components/analytics/linkedin-insight";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { Providers } from "@/components/providers/providers";
import {
  OrganizationSchema,
  SoftwareApplicationSchema,
  WebSiteSchema,
} from "@/components/seo/schema-org";
import { APP_NAME, SITE_URL } from "@/lib/constants";
import { googleSiteVerificationMetadata } from "@/lib/marketing/google-site-verification";

import "./globals.css";
import "../sentry.client.config";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...googleSiteVerificationMetadata(),
  title: {
    default: `${APP_NAME} — Your Restaurant. One Screen.`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "OS Kitchen replaces the chaos of tablets, printers, and spreadsheets with a single operating system. No extra hardware. 14-day free trial.",
  keywords: [
    "restaurant POS software",
    "kitchen display system",
    "table management software",
    "meal prep software",
    "bar POS software",
  ],
  authors: [{ name: APP_NAME }],
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    locale: "en_US",
    title: `${APP_NAME} — Your Restaurant. One Screen.`,
    description:
      "One screen for orders, kitchen, delivery, and staff. Launch in 15 minutes. 14-day free trial.",
    url: SITE_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} — The restaurant operating system`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Restaurant POS & Kitchen Operations Platform`,
    description:
      "One screen for orders, kitchen, delivery, and staff. Launch in 15 minutes.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${syne.variable} min-h-screen font-sans`}>
        <SkipToContent />
        <OrganizationSchema />
        <SoftwareApplicationSchema />
        <WebSiteSchema />
        <Providers>
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
        </Providers>
        <GoogleAnalytics />
        <GoogleAdsTracking />
        <MetaPixel />
        <LinkedInInsightTag />
        <CookieConsentBanner />
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
