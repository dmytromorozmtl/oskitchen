import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

/** Driver / delivery crew bookmark — role checks still enforced on sensitive APIs. */
export default async function DriverEntryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/driver");

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-slate-950 p-6 text-white">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">KitchenOS</p>
        <h1 className="mt-1 text-3xl font-semibold">Driver mode</h1>
        <p className="mt-2 max-w-lg text-sm text-slate-400">
          Mobile-first entry to routes and stops. Financial admin and full CRM remain on the desktop dashboard by
          design.
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:max-w-md">
        <Button asChild size="lg" className="h-14 rounded-2xl text-lg">
          <Link href="/dashboard/routes/driver">Today&apos;s route (driver)</Link>
        </Button>
        <Button asChild size="lg" variant="secondary" className="h-14 rounded-2xl text-lg">
          <Link href="/dashboard/routes">All routes</Link>
        </Button>
      </div>
    </div>
  );
}
