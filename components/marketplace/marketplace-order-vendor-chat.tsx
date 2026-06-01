"use client";

import { MessageSquare, Paperclip } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type ChatMessage = {
  id: string;
  body: string;
  from: "buyer" | "vendor";
  at: string;
};

export function MarketplaceOrderVendorChat({
  orderId,
  vendorName,
}: {
  orderId: string;
  vendorName: string;
}) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "system",
      body: `Order context attached · PO ${orderId.slice(0, 8)}…`,
      from: "vendor",
      at: new Date().toISOString(),
    },
  ]);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Vendor chat
        </CardTitle>
        <CardDescription>
          Message {vendorName} about this order. Real-time delivery arrives in the messaging module.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border/70 bg-muted/30 p-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-lg px-3 py-2 text-sm ${
                message.from === "buyer"
                  ? "ml-8 bg-primary text-primary-foreground"
                  : "mr-8 bg-background"
              }`}
            >
              <p>{message.body}</p>
              <p className="mt-1 text-[10px] opacity-70">
                {new Date(message.at).toLocaleString()} · read
              </p>
            </div>
          ))}
        </div>

        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about delivery, substitutions, or invoice details…"
          rows={3}
        />

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-full" disabled>
            <Paperclip className="mr-2 h-4 w-4" />
            Attach file
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-full"
            disabled={!draft.trim()}
            onClick={() => {
              if (!draft.trim()) return;
              setMessages((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  body: draft.trim(),
                  from: "buyer",
                  at: new Date().toISOString(),
                },
              ]);
              setDraft("");
            }}
          >
            Send message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
