import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { SkipToContent } from "@/components/a11y/skip-to-content";
import { CookieConsentBanner } from "@/components/analytics/cookie-consent";
import { GoogleAdsTracking } from "@/components/analytics/google-ads";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { LinkedInInsightTag } from "@/components/analytics/linkedin-insight";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...googleSiteVerificationMetadata(),
  title: {
    default: `${APP_NAME} — Restaurant POS & Kitchen Operations Platform`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "All-in-one POS, kitchen display, table management, and online ordering for restaurants, bars, cafés, and meal prep kitchens. 14-day free trial. No hardware required.",
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
    title: `${APP_NAME} — Restaurant POS & Kitchen Operations Platform`,
    description:
      "All-in-one POS, kitchen display, table management, and online ordering. 14-day free trial.",
    url: SITE_URL,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} — Operating System for Food Businesses`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Restaurant POS & Kitchen Operations Platform`,
    description:
      "POS, kitchen display, table management, and online ordering for modern food businesses.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen font-sans`}>
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
        <OfflineIndicator />
      </body>
    </html>
  );
}
