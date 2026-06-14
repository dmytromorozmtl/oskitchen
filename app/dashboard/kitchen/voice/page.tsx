import Link from "next/link";

import { KitchenVoicePanel } from "@/components/kitchen/kitchen-voice-panel";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export const metadata = {
  title: "Voice-Activated Kitchen",
  description: "Ask OS Kitchen how much ingredient stock remains and how many servings you can make.",
};

export default function KitchenVoicePage() {
  return (
    <SuspenseWave1PageBoundary sector="kitchen">
      <KitchenVoicePageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function KitchenVoicePageAsync() {
  await getTenantActor();

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Voice-Activated Kitchen</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Staff ask &ldquo;OS Kitchen, how much chicken is left?&rdquo; and hear stock plus bowl
            counts from live inventory and recipes — via Alexa, Google Home, or the simulator below.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/settings/voice">Voice settings</Link>
        </Button>
      </div>

      <KitchenVoicePanel />
    </div>
  );
}
