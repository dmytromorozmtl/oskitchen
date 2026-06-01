"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { MessageSquare, Paperclip } from "lucide-react";

import { sendVendorChatMessageAction } from "@/actions/marketplace/messaging";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  VendorChatMessage,
  VendorChatPerspective,
} from "@/services/marketplace/vendor-messaging-service";

export function VendorChat({
  orderId,
  counterpartyName,
  perspective,
  poNumber,
  initialMessages = [],
}: {
  orderId: string;
  counterpartyName: string;
  perspective: VendorChatPerspective;
  poNumber?: string | null;
  initialMessages?: VendorChatMessage[];
}) {
  const [messages, setMessages] = useState<VendorChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [showAttachment, setShowAttachment] = useState(false);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const response = await fetch(
      `/api/marketplace/orders/${orderId}/messages?perspective=${perspective}`,
      { cache: "no-store" },
    );
    if (!response.ok) return;
    const data = (await response.json()) as { messages: VendorChatMessage[] };
    setMessages(data.messages);
  }, [orderId, perspective]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refresh();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  function sendMessage() {
    const body = draft.trim();
    const attachments = attachmentUrl.trim() ? [attachmentUrl.trim()] : undefined;
    if (!body && !attachments?.length) return;

    startTransition(async () => {
      const result = await sendVendorChatMessageAction({
        orderId,
        perspective,
        message: body,
        attachments,
      });
      if (result.ok) {
        setDraft("");
        setAttachmentUrl("");
        setShowAttachment(false);
        await refresh();
      } else {
        toast.error(result.error ?? "Failed to send message");
      }
    });
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          {perspective === "vendor" ? "Buyer chat" : "Vendor chat"}
        </CardTitle>
        <CardDescription>
          Order {poNumber ?? orderId.slice(0, 8)} · message {counterpartyName}. Updates every 5s.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-border/70 bg-muted/30 p-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet — start the conversation.</p>
          ) : null}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-lg px-3 py-2 text-sm ${
                message.isSelf
                  ? "ml-8 bg-primary text-primary-foreground"
                  : "mr-8 border border-border/70 bg-background"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.body}</p>
              {message.attachments.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs underline opacity-90"
                    >
                      Attachment
                    </a>
                  ))}
                </div>
              ) : null}
              <p className="mt-1 text-[10px] opacity-70">
                {new Date(message.createdAt).toLocaleString()} ·{" "}
                {message.readAt ? "Read" : message.isSelf ? "Sent" : "Delivered"}
              </p>
            </div>
          ))}
        </div>

        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about delivery, substitutions, or invoice details…"
          rows={3}
          disabled={pending}
        />

        {showAttachment ? (
          <Input
            value={attachmentUrl}
            onChange={(event) => setAttachmentUrl(event.target.value)}
            placeholder="https://… attachment URL"
            className="rounded-full"
          />
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setShowAttachment((value) => !value)}
          >
            <Paperclip className="mr-2 h-4 w-4" />
            Attach file
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-full"
            disabled={pending || (!draft.trim() && !attachmentUrl.trim())}
            onClick={sendMessage}
          >
            Send message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** @deprecated Use VendorChat */
export function MarketplaceOrderVendorChat(props: {
  orderId: string;
  vendorName?: string;
  counterpartyName?: string;
  perspective?: VendorChatPerspective;
  poNumber?: string | null;
  initialMessages?: VendorChatMessage[];
}) {
  return (
    <VendorChat
      orderId={props.orderId}
      counterpartyName={props.counterpartyName ?? props.vendorName ?? "counterparty"}
      perspective={props.perspective ?? "buyer"}
      poNumber={props.poNumber}
      initialMessages={props.initialMessages}
    />
  );
}
