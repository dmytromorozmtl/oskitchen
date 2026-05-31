"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { submitPartnerAppRegistrationAction } from "@/actions/partner-app-register";
import { PARTNER_OAUTH_SCOPE_LABEL, PARTNER_OAUTH_SCOPES } from "@/lib/developer/partner-oauth-scopes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PartnerAppRegisterForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [scopes, setScopes] = useState<string[]>(["read:orders"]);

  function toggleScope(scope: string) {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setClientId(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await submitPartnerAppRegistrationAction({
        clientId: String(formData.get("clientId") ?? ""),
        name: String(formData.get("name") ?? ""),
        publisher: String(formData.get("publisher") ?? ""),
        description: String(formData.get("description") ?? ""),
        redirectUris: String(formData.get("redirectUris") ?? ""),
        allowedScopes: scopes as never[],
        embedUrl: String(formData.get("embedUrl") ?? ""),
        embedOrigins: String(formData.get("embedOrigins") ?? ""),
        contactEmail: String(formData.get("contactEmail") ?? ""),
        honestyNote: String(formData.get("honestyNote") ?? ""),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setClientId(result.clientId);
    });
  }

  if (clientId) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm">
        <p className="font-medium text-emerald-950 dark:text-emerald-100">Submission received</p>
        <p className="mt-2 text-muted-foreground">
          Your app <span className="font-mono">{clientId}</span> is in platform review. You will receive
          email at the contact address once approved for SANDBOX install.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clientId">Client ID (slug)</Label>
          <Input id="clientId" name="clientId" required placeholder="acme-ops-bridge" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Partner contact email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">App name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publisher">Publisher</Label>
          <Input id="publisher" name="publisher" required placeholder="Acme Systems Integrator" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="What does the app do? Which KitchenOS modules does it touch?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="redirectUris">Redirect URIs (one per line, HTTPS in production)</Label>
        <textarea
          id="redirectUris"
          name="redirectUris"
          required
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
          placeholder={"https://app.partner.com/oauth/callback\nhttp://localhost:3000/api/oauth/callback/sandbox"}
        />
      </div>

      <div className="space-y-2">
        <Label>Requested OAuth scopes</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {PARTNER_OAUTH_SCOPES.map((scope) => (
            <label key={scope} className="flex items-start gap-2 rounded-md border border-border/70 p-3 text-sm">
              <input
                type="checkbox"
                checked={scopes.includes(scope)}
                onChange={() => toggleScope(scope)}
              />
              <span>
                <span className="font-mono text-xs">{scope}</span>
                <span className="mt-0.5 block text-muted-foreground">{PARTNER_OAUTH_SCOPE_LABEL[scope]}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="embedUrl">Embedded admin URL (optional)</Label>
          <Input
            id="embedUrl"
            name="embedUrl"
            placeholder="https://app.partner.com/kitchenos/embed"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="embedOrigins">Embed frame origins (one per line)</Label>
          <textarea
            id="embedOrigins"
            name="embedOrigins"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            placeholder={"https://kitchenos.com\nhttps://app.partner.com"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="honestyNote">Honesty note (shown to merchants)</Label>
        <Input id="honestyNote" name="honestyNote" placeholder="Sandbox pilot — SI-led onboarding required." />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={pending || scopes.length === 0} className="rounded-full">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        <span className={pending ? "ml-2" : undefined}>Submit for review</span>
      </Button>
    </form>
  );
}
