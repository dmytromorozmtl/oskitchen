import { redirect } from "next/navigation";

import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

/** Bookmark-friendly alias for tablet KDS — fullscreen board lives on the kitchen route. */
export default function KitchenTabletAliasPage() {
  return (
    <SuspenseWave1PageBoundary sector="kitchen">
      <KitchenTabletAliasRedirectAsync />
    </SuspenseWave1PageBoundary>
  );
}

async function KitchenTabletAliasRedirectAsync() {
  redirect("/dashboard/kitchen/fullscreen");
}
