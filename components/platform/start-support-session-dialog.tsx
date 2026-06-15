"use client";

import { StartSupportSessionPanel } from "@/components/platform/start-support-session-panel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Optional dialog shell around the same audited form as `StartSupportSessionPanel`. */
export function StartSupportSessionDialog({ workspaceId }: { workspaceId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="secondary" className="rounded-full">
          Start session…
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Read-only support session</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Provide a ticket-scoped reason. Expiry is enforced; assisted edit stays disabled in this release.
          </DialogDescription>
        </DialogHeader>
        <StartSupportSessionPanel workspaceId={workspaceId} />
      </DialogContent>
    </Dialog>
  );
}
