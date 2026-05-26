"use client";

import Link from "next/link";
import { useEffect } from "react";

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
    <div className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-lg font-semibold">
        {isDb ? "Database connection failed" : "Something went wrong"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {isDb
          ? "KitchenOS could not reach Supabase (transaction pooler :6543). This is usually temporary or a local env issue."
          : error.message}
      </p>
      {isDb ? (
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
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
      ) : null}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
        >
          Try again
        </button>
        <Link href="/dashboard/storefront" className="rounded-md border px-3 py-2 text-sm">
          Back to storefront
        </Link>
      </div>
    </div>
  );
}
