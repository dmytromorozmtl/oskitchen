"use client";

import { useFormState } from "react-dom";

import { replayWebhookEventAction, type WebhookReplayActionState } from "@/actions/webhook-replay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  webhookEventId: string;
  signatureValid: boolean;
  surface: "platform" | "workspace";
};

const initial: WebhookReplayActionState | undefined = undefined;

export function WebhookReplayRow({ webhookEventId, signatureValid, surface }: Props) {
  const [state, formAction] = useFormState(replayWebhookEventAction, initial);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-2 text-left">
      <input type="hidden" name="webhookEventId" value={webhookEventId} />
      <input type="hidden" name="surface" value={surface} />
      <div className="space-y-1">
        <Label htmlFor={`reason-${webhookEventId}`} className="text-xs">
          Replay reason (audited)
        </Label>
        <Input
          id={`reason-${webhookEventId}`}
          name="reason"
          required
          minLength={8}
          maxLength={2000}
          placeholder="Why are you replaying this event?"
          className="h-8 text-xs"
        />
        <p className="text-[11px] text-muted-foreground">
          Do not enter customer personal data — reasons are retained per workspace audit policy (preview by default).
        </p>
      </div>
      {surface === "platform" && !signatureValid ? (
        <label className="flex items-center gap-2 text-xs text-amber-200/90">
          <input type="checkbox" name="allowInvalidSignature" value="on" />
          Allow replay despite invalid signature (dangerous — operator attests payload was verified out-of-band)
        </label>
      ) : null}
      <Button type="submit" size="sm" variant="secondary" className="h-8 w-fit text-xs">
        Request replay
      </Button>
      {state && "ok" in state && state.ok === true ? (
        <p className="text-xs text-emerald-600">{state.message ?? "Replay recorded."}</p>
      ) : null}
      {state && "ok" in state && state.ok === false && state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
