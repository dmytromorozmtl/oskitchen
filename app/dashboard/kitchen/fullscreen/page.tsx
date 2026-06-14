import { redirect } from "next/navigation";

import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export default function KitchenFullscreenRedirectPage() {
  return (
    <SuspenseWave1PageBoundary sector="kitchen">
      <KitchenFullscreenRedirectAsync />
    </SuspenseWave1PageBoundary>
  );
}

async function KitchenFullscreenRedirectAsync() {
  redirect("/dashboard/kitchen?fullscreen=1");
}
