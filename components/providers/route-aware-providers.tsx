"use client";

import { usePathname } from "next/navigation";

import { Providers } from "@/components/providers/providers";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { isOperationalSurface } from "@/lib/navigation/operational-surface";

/** Auth and operational routes skip PostHog, web vitals, toaster, and tooltip shell. */
export function RouteAwareProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isOperationalSurface(pathname)) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    );
  }

  return <Providers>{children}</Providers>;
}
