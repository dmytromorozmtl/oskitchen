"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

/** Force light theme on marketing and auth surfaces; dashboard/platform keep user preference. */
export function PublicThemeLock() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const path = pathname ?? "";
    const authenticatedApp =
      path.startsWith("/dashboard") ||
      path.startsWith("/platform") ||
      path.startsWith("/onboarding") ||
      path.startsWith("/visual-test");
    if (authenticatedApp) return;
    if (resolvedTheme !== "light") {
      setTheme("light");
    }
  }, [pathname, resolvedTheme, setTheme]);

  return null;
}
