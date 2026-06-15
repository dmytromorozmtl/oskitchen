"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { IntegrationProvider } from "@prisma/client";

import { processWebhookLabPayload } from "@/actions/channel-command-center";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const TEMPLATES: Record<string, string> = {
  "woo-order": JSON.stringify({ id: 1001, status: "processing", billing: { email: "lab@example.invalid" } }),
  "shopify-order": JSON.stringify({ id: 5001, email: "lab@example.invalid", line_items: [] }),
};

export function WebhookLabForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("order.created");
  const [provider, setProvider] = useState<IntegrationProvider>("WOOCOMMERCE");
  const [payload, setPayload] = useState(TEMPLATES["woo-order"]!);
  const [markTest, setMarkTest] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4 rounded-xl border border-border/70 bg-card/80 p-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-full"
          onClick={() => setPayload(TEMPLATES["woo-order"]!)}
        >
          Woo template
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-full"
          onClick={() => setPayload(TEMPLATES["shopify-order"]!)}
        >
          Shopify template
        </Button>
      </div>
      <div className="space-y-1">
        <Label>Provider</Label>
        <select
          className="w-full max-w-xs rounded-lg border border-input bg-background px-3 py-2 text-sm"
          value={provider}
          onChange={(e) => setProvider(e.target.value as IntegrationProvider)}
        >
          <option value="WOOCOMMERCE">WooCommerce</option>
          <option value="SHOPIFY">Shopify</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="topic">Topic label</Label>
        <input
          id="topic"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="payload">JSON payload</Label>
        <textarea
          id="payload"
          className="min-h-[180px] w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="markTest"
          type="checkbox"
          checked={markTest}
          onChange={(e) => setMarkTest(e.target.checked)}
          className="h-4 w-4 rounded border border-input"
        />
        <Label htmlFor="markTest" className="font-normal">
          Mark as test payload (wrapped, never calls partner APIs)
        </Label>
      </div>
      <Button
        type="button"
        className="rounded-full"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setResult(null);
            const res = await processWebhookLabPayload({
              provider,
              topic,
              payloadText: payload,
              markTest,
            });
            if ("error" in res) {
              setResult(res.error ?? "Request failed");
              return;
            }
            setResult(`Stored lab event ${res.eventId}`);
            router.refresh();
          })
        }
      >
        Store lab event
      </Button>
      {result ? <p className="text-sm text-muted-foreground">{result}</p> : null}
    </div>
  );
}
