"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ChannelRuleTrigger } from "@prisma/client";

import { createChannelRule } from "@/actions/channel-command-center";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ChannelRuleCreateForm() {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-3 rounded-xl border border-border/70 bg-muted/10 p-4"
      action={(fd) =>
        start(async () => {
          const name = String(fd.get("name") ?? "").trim();
          if (!name) return;
          const trigger = String(fd.get("trigger") ?? "WEBHOOK_RECEIVED") as ChannelRuleTrigger;
          const conditionsText = String(fd.get("conditions") ?? "{}");
          const actionsText = String(fd.get("actions") ?? "{}");
          let conditionsJson: unknown = {};
          let actionsJson: unknown = {};
          try {
            conditionsJson = JSON.parse(conditionsText);
            actionsJson = JSON.parse(actionsText);
          } catch {
            return;
          }
          await createChannelRule({
            name,
            description: String(fd.get("description") ?? "") || undefined,
            trigger,
            conditionsJson,
            actionsJson,
          });
          router.refresh();
        })
      }
    >
      <div className="space-y-1">
        <Label htmlFor="name">Rule name</Label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <input
          id="description"
          name="description"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="trigger">Trigger</Label>
        <select
          id="trigger"
          name="trigger"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          {(
            [
              "ORDER_IMPORTED",
              "PRODUCT_IMPORTED",
              "CUSTOMER_IMPORTED",
              "WEBHOOK_RECEIVED",
              "SYNC_COMPLETED",
              "IMPORT_FAILED",
            ] as const
          ).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="conditions">Conditions JSON</Label>
        <textarea
          id="conditions"
          name="conditions"
          defaultValue="{}"
          className="min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="actions">Actions JSON</Label>
        <textarea
          id="actions"
          name="actions"
          defaultValue='{"type":"require_manual_review"}'
          className="min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs"
        />
      </div>
      <Button type="submit" size="sm" className="rounded-full" disabled={pending}>
        Create rule
      </Button>
    </form>
  );
}
