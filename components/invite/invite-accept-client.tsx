"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteAcceptClient({
  token,
  storeName,
  workspaceName,
  role,
}: {
  token: string;
  storeName: string;
  workspaceName: string;
  role: string;
}) {
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const next = `/invite/${encodeURIComponent(token)}`;

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/invite/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email: email.trim() }),
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      setSent(true);
      toast.success(data?.message ?? "Check your email for a sign-in link.");
    } catch {
      toast.error("Could not send sign-in link. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        You were invited as <strong>{role}</strong> on workspace <strong>{workspaceName}</strong> for{" "}
        <strong>{storeName}</strong>.
      </p>

      {sent ? (
        <p className="rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          If your email matches this invitation, you will receive a sign-in link shortly. After signing in, you
          will return here to complete access.
        </p>
      ) : (
        <form onSubmit={sendMagicLink} className="space-y-3">
          <div>
            <Label htmlFor="invite-email">Work email</Label>
            <Input
              id="invite-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={pending}>
            {pending ? "Sending…" : "Email me a sign-in link"}
          </Button>
        </form>
      )}

      <div className="space-y-2 border-t border-border/60 pt-4">
        <p className="text-xs text-muted-foreground">Already have an account?</p>
        <Button asChild variant="outline" className="w-full rounded-full">
          <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in with password</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full rounded-full">
          <Link href={`/signup?next=${encodeURIComponent(next)}`}>Create account</Link>
        </Button>
      </div>
    </div>
  );
}
