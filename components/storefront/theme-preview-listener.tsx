"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import {
  applyThemePreviewToRoot,
  isThemePreviewMessage,
} from "@/lib/storefront/theme-preview-message";

/** Listens for theme updates from the dashboard customizer iframe parent. */
export function ThemePreviewListener() {
  const searchParams = useSearchParams();
  const preview =
    searchParams.get("preview") === "1" ||
    searchParams.get("preview") === "true";

  React.useEffect(() => {
    if (!preview) return;

    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (!isThemePreviewMessage(e.data)) return;
      const root = document.querySelector(".kos-storefront-root") as HTMLElement | null;
      if (root && e.data.theme) {
        applyThemePreviewToRoot(root, e.data.theme);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [preview]);

  return null;
}
