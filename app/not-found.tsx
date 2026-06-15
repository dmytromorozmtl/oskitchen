import Link from "next/link";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/today">Open dashboard</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
