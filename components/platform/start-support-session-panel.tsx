"use client";

import { useFormStatus } from "react-dom";

import { startPlatformSupportSessionAction } from "@/actions/platform-support-session";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="rounded-full" disabled={pending}>
      {pending ? "Starting…" : "Start read-only session"}
    </Button>
  );
}

export function StartSupportSessionPanel(props: {
  workspaceId: string;
  redirectTo?: string;
}) {
  return (
    <form
      action={startPlatformSupportSessionAction}
      className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-200"
    >
      <input type="hidden" name="workspaceId" value={props.workspaceId} />
      {props.redirectTo ? <input type="hidden" name="redirectTo" value={props.redirectTo} /> : null}
      <input type="hidden" name="mode" value="READ_ONLY" />
      <div>
        <Label htmlFor="support-reason" className="text-zinc-300">
          Reason (required)
        </Label>
        <Textarea
          id="support-reason"
          name="reason"
          required
          minLength={4}
          maxLength={500}
          rows={3}
          className="mt-1 border-zinc-700 bg-zinc-950 text-zinc-100"
          placeholder="Ticket id, customer request, or investigation scope"
        />
      </div>
      <div>
        <Label htmlFor="ttlHours" className="text-zinc-300">
          Session length
        </Label>
        <select
          id="ttlHours"
          name="ttlHours"
          defaultValue="2"
          className="mt-1 flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
        >
          {[1, 2, 4, 8].map((h) => (
            <option key={h} value={String(h)}>
              {h} hour{h > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-zinc-500">
        READ_ONLY foundation — no credential access and no assisted edits in this release. Session is audited; workspace
        members see a notice in the dashboard.
      </p>
      <SubmitButton />
    </form>
  );
}
