"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { toast } from "sonner";

import { generateOutreachMessage } from "@/actions/growth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function OutreachForm({
  leads,
}: {
  leads: { id: string; label: string }[];
}) {
  const [text, setText] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  return (
    <div className="space-y-4">
      <form
        className="grid gap-4 md:grid-cols-2"
        action={(fd) =>
          startTransition(async () => {
            const res = await generateOutreachMessage(fd);
            if ("error" in res && res.error) toast.error(getActionError(res) ?? "Something went wrong");
            else if ("text" in res && res.text) {
              setText(res.text);
              toast.success("Draft generated — review before sending.");
            }
          })
        }
      >
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="leadId">Lead</Label>
          <select
            id="leadId"
            name="leadId"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select…</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="template">Template</Label>
          <select
            id="template"
            name="template"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue="cold_email"
          >
            <option value="cold_email">Cold email</option>
            <option value="linkedin_dm">LinkedIn DM</option>
            <option value="follow_up_1">Follow-up 1</option>
            <option value="follow_up_2">Follow-up 2</option>
            <option value="demo_recap">Demo recap</option>
            <option value="beta_invite">Beta invitation</option>
            <option value="integration_soon">Integration coming soon</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending} className="rounded-full">
            {pending ? "Generating…" : "Generate draft"}
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        <Label htmlFor="out">Review & copy</Label>
        <Textarea
          id="out"
          readOnly
          rows={14}
          value={text}
          placeholder="Generated copy appears here — nothing sends automatically."
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
}
