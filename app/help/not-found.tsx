import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HelpNotFound() {
  return (
    <div
      className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center"
      data-testid="segment-not-found-help"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Help article not found</h1>
      <p className="mt-3 text-muted-foreground">
        This help page does not exist or may have moved to a new location.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full">
          <Link href="/help">Help home</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/help/faq">FAQ</Link>
        </Button>
      </div>
    </div>
  );
}
