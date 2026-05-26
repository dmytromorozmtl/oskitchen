"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  approveChannelImportRecords,
  exportChannelImportErrorCsv,
} from "@/actions/channel-command-center";
import { Button } from "@/components/ui/button";

export function ImportBatchToolbar({
  batchId,
  validRecordIds,
}: {
  batchId: string;
  validRecordIds: string[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        className="rounded-full"
        disabled={pending || validRecordIds.length === 0}
        onClick={() =>
          start(async () => {
            await approveChannelImportRecords({ recordIds: validRecordIds });
            router.refresh();
          })
        }
      >
        Import all valid
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await exportChannelImportErrorCsv(batchId);
            if ("error" in res) return;
            const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `channel-import-errors-${batchId}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          })
        }
      >
        Export errors CSV
      </Button>
    </div>
  );
}
