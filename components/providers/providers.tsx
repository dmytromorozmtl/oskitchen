"use client";

import { Suspense } from "react";

import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { WebVitalsReporter } from "@/components/analytics/web-vitals-reporter";
import { PublicThemeLock } from "@/components/providers/public-theme-lock";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={200}>
        <Suspense fallback={null}>
          <PostHogProvider>
            <PublicThemeLock />
            <WebVitalsReporter />
            {children}
          </PostHogProvider>
        </Suspense>
        <Toaster richColors position="top-center" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
