"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type {
  ImplementationChecklistPriority,
  ImplementationChecklistStatus,
} from "@prisma/client";

import { updateChecklistItemAction } from "@/actions/implementation-center";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CHECKLIST_PRIORITY_LABEL,
  CHECKLIST_STATUS_LABEL,
} from "@/lib/implementation/implementation-status";

const STATUS_OPTIONS: ImplementationChecklistStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE", "SKIPPED"];

export function ChecklistRow({
  projectId,
  item,
}: {
  projectId: string;
  item: {
    id: string;
    title: string;
    description: string | null;
    status: ImplementationChecklistStatus;
    priority: ImplementationChecklistPriority;
    moduleKey: string | null;
    actionRoute: string | null;
    requiredForGoLive: boolean;
    blockerReason: string | null;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleStatus(status: ImplementationChecklistStatus) {
    startTransition(async () => {
      const res = await updateChecklistItemAction({
        projectId,
        itemId: item.id,
        status,
      });
      if ("ok" in res && res.ok) router.refresh();
    });
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{item.title}</h3>
            {item.requiredForGoLive ? (
              <Badge className="border bg-amber-100 text-amber-900 border-amber-200">required</Badge>
            ) : null}
            <Badge variant="outline">{CHECKLIST_PRIORITY_LABEL[item.priority]}</Badge>
            {item.moduleKey ? (
              <Badge variant="outline" className="capitalize">
                {item.moduleKey.replaceAll("_", " ")}
              </Badge>
            ) : null}
            <Badge>{CHECKLIST_STATUS_LABEL[item.status]}</Badge>
          </div>
          {item.description ? (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          ) : null}
          {item.status === "BLOCKED" && item.blockerReason ? (
            <p className="text-xs text-rose-600">Blocked: {item.blockerReason}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {item.actionRoute ? (
            <Button asChild variant="outline" size="sm">
              <Link href={item.actionRoute}>Open</Link>
            </Button>
          ) : null}
          <select
            value={item.status}
            onChange={(e) => handleStatus(e.target.value as ImplementationChecklistStatus)}
            disabled={pending}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {CHECKLIST_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
