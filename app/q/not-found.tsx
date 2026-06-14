import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function QrOrderingNotFound() {
  return (
    <div
      className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center text-zinc-50"
      data-testid="segment-not-found-q"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">404</p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">QR menu not found</h1>
      <p className="mt-3 text-zinc-400">
        This table or QR link is invalid, expired, or the store may have changed its menu URL.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full">
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full border-zinc-700">
          <Link href="/demo">View demo</Link>
        </Button>
      </div>
    </div>
  );
}
