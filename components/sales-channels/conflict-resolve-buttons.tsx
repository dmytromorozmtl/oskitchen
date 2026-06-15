"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { resolveChannelConflict } from "@/actions/channel-command-center";
import { Button } from "@/components/ui/button";

export function ConflictResolveButtons({ conflictId }: { conflictId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex gap-1">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="rounded-full"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await resolveChannelConflict({ conflictId, status: "RESOLVED" });
            router.refresh();
          })
        }
      >
        Resolve
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-full"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await resolveChannelConflict({ conflictId, status: "IGNORED" });
            router.refresh();
          })
        }
      >
        Ignore
      </Button>
    </div>
  );
}
