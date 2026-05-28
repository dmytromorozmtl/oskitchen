import Link from "next/link";

import {
  resolveWebhookQueueRowNextAction,
  type WebhookQueueEventFocus,
} from "@/lib/integrations/webhook-queue-focus-era18";

export function WebhookQueueRowNextAction(props: { event: WebhookQueueEventFocus }) {
  const action = resolveWebhookQueueRowNextAction(props.event);

  if (!action) {
    return <span className="text-xs text-muted-foreground">Processed</span>;
  }

  return (
    <Link
      href={action.href}
      data-testid={`webhook-queue-next-action-${props.event.id}`}
      className={
        action.tone === "urgent"
          ? "text-xs font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-200"
          : "text-xs font-medium text-primary underline-offset-2 hover:underline"
      }
    >
      {action.label}
    </Link>
  );
}
