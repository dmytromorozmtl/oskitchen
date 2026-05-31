"use client";

import { useEffect } from "react";

import { BRAND_ACCENT, BRAND_ACCENT_DARK, BRAND_INK } from "@/lib/constants";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        className="min-h-screen antialiased"
        style={{
          background: "#FFFFFF",
          color: BRAND_INK,
          fontFamily: "var(--font-body, 'DM Sans', system-ui, sans-serif)",
        }}
      >
        <main className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
          <p
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: BRAND_ACCENT }}
          >
            500
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-3" style={{ color: "#3A3B40" }}>
            An unexpected error occurred. Our team has been notified. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-full px-6 py-2.5 text-sm font-medium text-white"
            style={{ background: BRAND_ACCENT }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = BRAND_ACCENT_DARK;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = BRAND_ACCENT;
            }}
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="mt-4 text-sm underline-offset-4 hover:underline"
            style={{ color: BRAND_ACCENT }}
          >
            Return home
          </button>
        </main>
      </body>
    </html>
  );
}
