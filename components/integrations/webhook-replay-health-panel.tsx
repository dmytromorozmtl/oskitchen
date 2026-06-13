import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  pickWebhookQueueAttentionItems,
  type WebhookQueueFocusSnapshot,
} from "@/lib/integrations/webhook-queue-focus-era18";
import { WEBHOOK_QUEUE_ROUTE } from "@/lib/integrations/webhook-queue-focus-era18-policy";

type Props = {
  snapshot: WebhookQueueFocusSnapshot;
};

export function WebhookReplayHealthPanel({ snapshot }: Props) {
  const items = pickWebhookQueueAttentionItems(snapshot);
  const hasIssues = items.length > 0;

  if (!hasIssues) {
    return (
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base">Webhook replay</CardTitle>
          <CardDescription>
            No failed or unprocessed inbound webhooks in the last queue window — replay tooling
            remains available from the channel webhook center.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={WEBHOOK_QUEUE_ROUTE}>Open webhook log →</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <CardHeader>
        <CardTitle className="text-base">Webhook replay needed</CardTitle>
        <CardDescription>
          Triage root cause first — then request an audited replay per failed event.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id}>
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </li>
          ))}
        </ul>
        <Button asChild size="sm" className="rounded-full">
          <Link href={WEBHOOK_QUEUE_ROUTE}>Review &amp; replay webhooks →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
