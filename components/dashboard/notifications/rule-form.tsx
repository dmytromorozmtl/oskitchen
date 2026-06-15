"use client";

import * as React from "react";
import { toast } from "sonner";

import { installDefaultRulesAction, updateRuleAction } from "@/actions/notifications-center";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InstallDefaultsButton() {
  const [pending, setPending] = React.useState(false);
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const res = await installDefaultRulesAction();
        setPending(false);
        if ("ok" in res && res.ok) toast.success(`Installed ${res.created} new rules.`);
        else toast.error(res.error ?? "Install failed.");
      }}
    >
      {pending ? "Installing…" : "Install defaults"}
    </Button>
  );
}

export function RuleRowControls({
  id,
  enabled,
  offsetMinutes,
  dedupeWindowMinutes,
}: {
  id: string;
  enabled: boolean;
  offsetMinutes: number;
  dedupeWindowMinutes: number;
}) {
  const [pendingToggle, setPendingToggle] = React.useState(false);
  const [pendingSave, setPendingSave] = React.useState(false);
  const [offset, setOffset] = React.useState(String(offsetMinutes));
  const [dedupe, setDedupe] = React.useState(String(dedupeWindowMinutes));

  async function toggle(next: boolean) {
    setPendingToggle(true);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("enabled", next ? "true" : "false");
    const res = await updateRuleAction(fd);
    setPendingToggle(false);
    if ("ok" in res && res.ok) toast.success(next ? "Enabled." : "Disabled.");
    else toast.error(res.error ?? "Toggle failed.");
  }

  async function save() {
    setPendingSave(true);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("offsetMinutes", offset);
    fd.set("dedupeWindowMinutes", dedupe);
    const res = await updateRuleAction(fd);
    setPendingSave(false);
    if ("ok" in res && res.ok) toast.success("Saved.");
    else toast.error(res.error ?? "Save failed.");
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor={`offset-${id}`} className="text-xs">Offset (min)</Label>
        <Input id={`offset-${id}`} className="w-28" value={offset} onChange={(e) => setOffset(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`dedupe-${id}`} className="text-xs">Dedupe window (min)</Label>
        <Input id={`dedupe-${id}`} className="w-32" value={dedupe} onChange={(e) => setDedupe(e.target.value)} />
      </div>
      <Button size="sm" onClick={save} disabled={pendingSave}>{pendingSave ? "Saving…" : "Save"}</Button>
      <Button size="sm" variant="outline" disabled={pendingToggle} onClick={() => toggle(!enabled)}>
        {enabled ? "Disable" : "Enable"}
      </Button>
    </div>
  );
}
