"use client";

import { useEffect } from "react";

import { RouteError } from "@/components/dashboard/route-states";

export default function StorefrontAdvancedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[storefront/advanced]", error);
  }, [error]);

  const isDb =
    /Can't reach database server|PrismaClientInitializationError|P1001|invalid database string/i.test(
      error.message,
    );

  return (
    <RouteError
      error={error}
      reset={reset}
      title={isDb ? "Database connection failed" : undefined}
      description={
        isDb ? (
          <div className="space-y-3 text-left">
            <p>
              OS Kitchen could not reach Supabase (transaction pooler :6543). This is usually
              temporary or a local env issue.
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                Restart dev in a <strong>new terminal</strong>:{" "}
                <code className="rounded bg-muted px-1">npm run dev:safe</code>
              </li>
              <li>
                Do not run <code className="rounded bg-muted px-1">source .env.production.local</code>
              </li>
              <li>Supabase Dashboard → confirm project is not Paused</li>
              <li>
                Terminal check:{" "}
                <code className="rounded bg-muted px-1">npm run check:database-connectivity</code>
              </li>
            </ul>
          </div>
        ) : undefined
      }
      homeHref="/dashboard/storefront"
      homeLabel="Back to storefront"
    />
  );
}
