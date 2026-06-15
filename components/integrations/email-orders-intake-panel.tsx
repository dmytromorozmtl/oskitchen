"use client";

import { useState } from "react";
import { toast } from "sonner";

export function EmailOrdersIntakePanel({ aiAssistAvailable }: { aiAssistAvailable: boolean }) {
  const [emailText, setEmailText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (emailText.trim().length < 10) {
      toast.error("Paste the full email body (at least 10 characters)");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/integrations/email-orders/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailText }),
    });
    const json = (await res.json()) as { message?: string; ok?: boolean; skippedExisting?: boolean };
    setLoading(false);

    if (!res.ok || json.ok === false) {
      toast.error(json.message ?? "Import failed");
      return;
    }

    setMessage(json.message ?? "Done");
    if (json.skippedExisting) {
      toast.message(json.message ?? "Already imported");
    } else {
      toast.success(json.message ?? "Email order imported");
      setEmailText("");
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted-foreground">
        BETA — paste a customer email below. Heuristic parser extracts From, Subject, line items, and
        total. {aiAssistAvailable ? "OPENAI_API_KEY is configured for future assist experiments." : "No AI assist configured — heuristic only."}
      </p>

      <textarea
        value={emailText}
        onChange={(e) => setEmailText(e.target.value)}
        rows={12}
        placeholder={"From: Jane Doe <jane@example.com>\nSubject: Friday pickup order\n\n2x Meal prep box\n1x Soup\n\nTotal: $58"}
        className="w-full rounded-xl border bg-background p-3 font-mono text-xs"
      />

      <button
        type="button"
        disabled={loading}
        onClick={() => void submit()}
        className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {loading ? "Importing…" : "Import email order"}
      </button>

      {message ? <p className="text-muted-foreground">{message}</p> : null}
    </div>
  );
}
