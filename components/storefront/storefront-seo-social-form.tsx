"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StorefrontSeoSocial } from "@/lib/storefront/theme-draft";

export function StorefrontSeoSocialForm({
  storefrontId,
  initial,
}: {
  storefrontId: string;
  initial: StorefrontSeoSocial;
}) {
  const [form, setForm] = React.useState({
    ogTitle: initial.ogTitle ?? "",
    ogDescription: initial.ogDescription ?? "",
    twitterTitle: initial.twitterTitle ?? "",
    twitterDescription: initial.twitterDescription ?? "",
  });
  const [pending, setPending] = React.useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/storefront/theme/seo-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storefrontId, seoSocial: form }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not save");
        return;
      }
      toast.success("Social SEO saved");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSave(e)} className="space-y-4 border-t border-border/80 pt-6">
      <p className="text-sm font-semibold">Open Graph &amp; Twitter</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ogTitle">OG title</Label>
          <Input
            id="ogTitle"
            value={form.ogTitle}
            onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitterTitle">Twitter title</Label>
          <Input
            id="twitterTitle"
            value={form.twitterTitle}
            onChange={(e) => setForm({ ...form, twitterTitle: e.target.value })}
            className="rounded-xl"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ogDescription">OG description</Label>
        <Textarea
          id="ogDescription"
          rows={2}
          value={form.ogDescription}
          onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="twitterDescription">Twitter description</Label>
        <Textarea
          id="twitterDescription"
          rows={2}
          value={form.twitterDescription}
          onChange={(e) => setForm({ ...form, twitterDescription: e.target.value })}
          className="rounded-xl"
        />
      </div>
      <Button type="submit" disabled={pending} className="rounded-full">
        {pending ? "Saving…" : "Save social meta"}
      </Button>
    </form>
  );
}
