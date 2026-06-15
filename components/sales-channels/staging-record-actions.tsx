"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  approveChannelImportRecords,
  retryChannelImportValidation,
} from "@/actions/channel-command-center";
import { Button } from "@/components/ui/button";

export function StagingRecordActions({
  recordId,
  canApprove,
  canRetry,
}: {
  recordId: string;
  canApprove: boolean;
  canRetry: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap justify-end gap-1">
      {canRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await retryChannelImportValidation({ recordId });
              router.refresh();
            })
          }
        >
          Retry validation
        </Button>
      ) : null}
      {canApprove ? (
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await approveChannelImportRecords({ recordIds: [recordId] });
              router.refresh();
            })
          }
        >
          Approve
        </Button>
      ) : null}
    </div>
  );
}
