"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { rollbackChannelImportBatch } from "@/actions/channel-command-center";
import { Button } from "@/components/ui/button";

export function ImportRollbackButton({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      className="rounded-full"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const reason = window.prompt("Rollback reason (optional)") ?? "";
          const res = await rollbackChannelImportBatch({ batchId, reason: reason || undefined });
          if ("error" in res) {
            window.alert(res.error);
            return;
          }
          router.refresh();
        })
      }
    >
      Rollback safe approvals
    </Button>
  );
}
