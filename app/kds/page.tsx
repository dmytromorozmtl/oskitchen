import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

/** Public path for bookmarking a tablet — still requires sign-in (no anonymous KDS). */
export default async function KdsEntryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/kds");

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-zinc-950 p-6 text-white">
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">OS Kitchen</p>
        <h1 className="mt-1 text-3xl font-semibold">Kitchen display mode</h1>
        <p className="mt-2 max-w-lg text-sm text-zinc-400">
          Large-touch entry point. Station filters and live updates stay on the kitchen screen; this page avoids
          crowding the surface with billing or admin chrome.
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:max-w-md">
        <Button asChild size="lg" className="h-14 rounded-2xl text-lg">
          <Link href="/dashboard/kitchen/fullscreen">Open fullscreen kitchen</Link>
        </Button>
        <Button asChild size="lg" variant="secondary" className="h-14 rounded-2xl text-lg">
          <Link href="/dashboard/kitchen">Standard kitchen screen</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-2xl border-zinc-700 text-zinc-200">
          <Link href="/dashboard/production">Production board</Link>
        </Button>
      </div>
    </div>
  );
}
