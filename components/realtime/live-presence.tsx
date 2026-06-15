"use client";

type Props = {
  surface?: string;
};

/** Presence placeholder — avoids claiming live viewers until presence transport exists. */
export function LivePresence({ surface = "this screen" }: Props) {
  return (
    <p className="text-sm text-muted-foreground">
      Team presence on {surface} will show who is packing, dispatching, or editing orders once presence
      channels are enabled for your workspace.
    </p>
  );
}
