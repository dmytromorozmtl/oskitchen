"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify: (distinctId: string, properties?: Record<string, unknown>) => void;
    };
  }
}

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";

/**
 * Lightweight PostHog loader — only active when NEXT_PUBLIC_POSTHOG_KEY is set.
 * Dashboard + marketing paths; respects cookie consent on marketing via existing banner.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!key || typeof window === "undefined") return;

    let cancelled = false;

    void (async () => {
      try {
        const mod = await import("posthog-js");
        const posthog = mod.default;
        if (cancelled) return;
        posthog.init(key, {
          api_host: host,
          capture_pageview: false,
          persistence: "localStorage+cookie",
        });
        window.posthog = posthog;
      } catch {
        /* Optional: npm install posthog-js when enabling NEXT_PUBLIC_POSTHOG_KEY */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!key || !window.posthog) return;
    window.posthog.capture("$pageview", { $current_url: pathname });
  }, [pathname]);

  return <>{children}</>;
}
