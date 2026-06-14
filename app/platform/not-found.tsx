import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function PlatformNotFound() {
  return (
    <div
      className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center text-zinc-50"
      data-testid="segment-not-found-platform"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-200">404</p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Platform page not found</h1>
      <p className="mt-3 text-zinc-400">
        This internal platform page does not exist or your role may not have access to it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full">
          <Link href="/platform/dashboard">Platform dashboard</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full border-zinc-700">
          <Link href="/platform/support">Support queue</Link>
        </Button>
      </div>
    </div>
  );
}
