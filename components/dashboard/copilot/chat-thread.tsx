"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { chatTurnAction } from "@/actions/copilot";

type Message = { id: string; role: "USER" | "ASSISTANT" | "SYSTEM" | "TOOL"; content: string };

const SAMPLE_PROMPTS = [
  "What should I focus on today?",
  "Which orders are late?",
  "What production tasks are blocked?",
  "Summarize this week's catering pipeline.",
  "What ingredients might be short?",
  "Draft tasks for today's packing issues.",
];

export function ChatThread({
  initialMessages,
  initialConversationId,
}: {
  initialMessages: Message[];
  initialConversationId: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function submit(content: string) {
    if (!content.trim()) return;
    const localId = `local-${Date.now()}`;
    setMessages((m) => [...m, { id: localId, role: "USER", content }]);
    setInput("");
    setStatus(null);
    setError(null);
    startTransition(async () => {
      const res = await chatTurnAction({ conversationId, message: content });
      if (!res.ok) {
        setError(res.error ?? "Unable to send");
        return;
      }
      if (res.conversationId) setConversationId(res.conversationId);
      setStatus(res.status ?? null);
      setMessages((m) => [
        ...m,
        { id: `reply-${Date.now()}`, role: "ASSISTANT", content: res.reply ?? "" },
      ]);
    });
  }

  return (
    <div className="space-y-3">
      <div
        ref={listRef}
        className="max-h-[60vh] min-h-[24rem] space-y-3 overflow-y-auto rounded-lg border border-border/80 p-4"
      >
        {messages.length === 0 ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Try one of these to get started:</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => submit(p)}
                  className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-muted/80"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "USER"
                  ? "ml-8 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                  : "mr-8 whitespace-pre-wrap rounded-md bg-muted px-3 py-2 text-sm"
              }
            >
              {m.content}
            </div>
          ))
        )}
      </div>
      {status && (
        <p className="text-xs text-muted-foreground">
          Reply mode: <span className="font-mono">{status}</span>
        </p>
      )}
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the copilot…"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          maxLength={2000}
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {pending ? "Thinking…" : "Send"}
        </button>
      </form>
      <p className="text-xs text-muted-foreground">
        Copilot replies are generated from a redacted operational summary. Drafted actions never run
        without human approval.
      </p>
    </div>
  );
}
