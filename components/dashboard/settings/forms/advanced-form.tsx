"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveAdvancedSettings } from "@/actions/settings-center";
import { StickySaveBar } from "@/components/dashboard/settings/sticky-save-bar";
import type { AdvancedSettings } from "@/lib/settings/settings-defaults";

export function AdvancedForm({ initial }: { initial: AdvancedSettings }) {
  const [state, setState] = useState<AdvancedSettings>(initial);
  const [base, setBase] = useState<AdvancedSettings>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(state) !== JSON.stringify(base);

  function onSave() {
    startTransition(async () => {
      const res = await saveAdvancedSettings({
        ...state,
        transferContactEmail: state.transferContactEmail ?? "",
      });
      if (res.ok) {
        setBase(state);
        toast.success("Advanced preferences saved.");
      } else toast.error(`Save failed: ${res.error}`);
    });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
      <Card className="border-amber-500/40">
        <CardHeader>
          <CardTitle className="text-base text-amber-900">Workspace archive</CardTitle>
          <CardDescription>
            Archiving disables most modules and hides workspace-wide content from the dashboard. Data remains in the database.
            This is the safe alternative to deletion.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-amber-300/50 bg-amber-50/50 p-3">
            <Switch id="adv-archived" checked={state.workspaceArchived} onCheckedChange={(v) => setState((s) => ({ ...s, workspaceArchived: v }))} />
            <div className="min-w-0">
              <Label htmlFor="adv-archived" className="text-sm font-medium">Workspace archived</Label>
              <p className="text-xs text-muted-foreground">Returns workspace to a read-only state. Re-enable to resume operations.</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Ownership transfer contact</Label>
            <Input
              type="email"
              value={state.transferContactEmail ?? ""}
              onChange={(e) => setState((s) => ({ ...s, transferContactEmail: e.target.value || null }))}
              placeholder="Email of new owner"
            />
          </div>
        </CardContent>
      </Card>
      <StickySaveBar dirty={dirty} saving={pending} onSave={onSave} onDiscard={() => setState(base)} message="Unsaved advanced changes" />
    </form>
  );
}
