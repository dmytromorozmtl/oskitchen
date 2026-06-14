import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function StorefrontNotFound() {
  return (
    <div
      className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center"
      data-testid="segment-not-found-storefront"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Store not found</h1>
      <p className="mt-3 text-muted-foreground">
        This storefront page does not exist or the store may have moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full">
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/demo">View demo</Link>
        </Button>
      </div>
    </div>
  );
}
