import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted-foreground">
        This dashboard page does not exist or you may not have access to it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full">
          <Link href="/dashboard/today">Today</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/orders">Orders</Link>
        </Button>
      </div>
    </div>
  );
}
