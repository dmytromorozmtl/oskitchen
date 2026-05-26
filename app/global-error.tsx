"use client";

import { useEffect } from "react";

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
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <main className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#286ab8]">500</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-slate-600">
            An unexpected error occurred. Our team has been notified. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-full bg-[#286ab8] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1e4f8c]"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="mt-4 text-sm text-[#286ab8] underline-offset-4 hover:underline"
          >
            Return home
          </button>
        </main>
      </body>
    </html>
  );
}
