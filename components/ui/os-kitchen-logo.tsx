import Link from "next/link";
import React from "react";

import { cn } from "@/lib/utils";

type OSKitchenLogoProps = {
  className?: string;
  href?: string | null;
  size?: "sm" | "md" | "lg";
  /** Light text for dark backgrounds (footer, hero overlays). */
  variant?: "default" | "light";
};

const sizeMap = {
  sm: "0.9375rem",
  md: "1.0625rem",
  lg: "1.25rem",
} as const;

export function OSKitchenLogo({
  className,
  href = "/",
  size = "md",
  variant = "default",
}: OSKitchenLogoProps) {
  const light = variant === "light";

  const logo = (
    <span
      className={cn("inline-flex items-baseline whitespace-nowrap", className)}
      style={{
        fontFamily: "var(--font-display, var(--font-display-fallback))",
        fontWeight: 600,
        fontSize: sizeMap[size],
        letterSpacing: "-0.045em",
        lineHeight: 1,
        color: light ? "var(--color-text-inverse)" : "var(--color-text)",
      }}
    >
      OS
      <span
        style={{
          marginInline: "0.2em",
          fontWeight: 400,
          color: light ? "rgba(245,245,240,0.35)" : "rgba(13,14,18,0.22)",
        }}
        aria-hidden
      >
        /
      </span>
      Kitchen
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline transition-opacity hover:opacity-80">
        {logo}
      </Link>
    );
  }

  return logo;
}
