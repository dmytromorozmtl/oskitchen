"use client";

import { useState, useTransition } from "react";

import {
  saveVoiceSettingsAction,
  testVoiceParseAction,
} from "@/actions/voice-ordering";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { VoiceIntegrationSettings } from "@/lib/voice/voice-settings";

export function VoiceSettingsPanel({
  initial,
  alexaWebhookUrl,
  googleWebhookUrl,
}: {
  initial: VoiceIntegrationSettings;
  alexaWebhookUrl: string;
  googleWebhookUrl: string;
}) {
  const [settings, setSettings] = useState(initial);
  const [utterance, setUtterance] = useState("Alexa, ask OS Kitchen to add two lattes to table 5");
  const [parseResult, setParseResult] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(patch: Partial<VoiceIntegrationSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("enabled", next.enabled ? "on" : "off");
      fd.set("alexaEnabled", next.alexaEnabled ? "on" : "off");
      fd.set("googleEnabled", next.googleEnabled ? "on" : "off");
      fd.set("wakePhrase", next.wakePhrase);
      const res = await saveVoiceSettingsAction(fd);
      setMessage(res.ok ? "Voice settings saved." : res.error);
    });
  }

  function runParseTest() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("utterance", utterance);
      const res = await testVoiceParseAction(fd);
      if (!res.ok) {
        setParseResult(res.error);
        return;
      }
      const p = res.data.parsed;
      setParseResult(
        `${p.lines.map((l) => `${l.quantity}× ${l.title}`).join(", ")} → ${p.tableLabel} (${p.confidence}% confidence)`,
      );
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div>
          <p className="font-medium">Voice ordering</p>
          <p className="text-sm text-muted-foreground">
            Alexa and Google Home send orders to your kitchen display.
          </p>
        </div>
        <Switch
          checked={settings.enabled}
          onCheckedChange={(v) => save({ enabled: v })}
          disabled={pending}
          data-testid="voice-enabled-switch"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="alexa">Amazon Alexa</Label>
          <Switch
            id="alexa"
            checked={settings.alexaEnabled}
            onCheckedChange={(v) => save({ alexaEnabled: v })}
            disabled={pending || !settings.enabled}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="google">Google Home</Label>
          <Switch
            id="google"
            checked={settings.googleEnabled}
            onCheckedChange={(v) => save({ googleEnabled: v })}
            disabled={pending || !settings.enabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="wakePhrase">Wake phrase</Label>
        <Input
          id="wakePhrase"
          value={settings.wakePhrase}
          onChange={(e) => setSettings((s) => ({ ...s, wakePhrase: e.target.value }))}
          onBlur={() => save({ wakePhrase: settings.wakePhrase })}
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label>Webhook secret</Label>
        <p className="break-all font-mono text-xs text-muted-foreground">{settings.webhookSecret}</p>
        <p className="text-xs text-muted-foreground">
          Send as header <code className="rounded bg-muted px-1">X-Voice-Secret</code> with your
          owner user id in the JSON body.
        </p>
      </div>

      <div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
        <p className="font-medium">Alexa skill endpoint</p>
        <p className="break-all font-mono text-xs">{alexaWebhookUrl}</p>
        <p className="mt-3 font-medium">Google Home fulfillment</p>
        <p className="break-all font-mono text-xs">{googleWebhookUrl}</p>
      </div>

      <div className="space-y-2 rounded-lg border p-4">
        <Label htmlFor="test-utterance">Test voice command (AI-assisted parse)</Label>
        <Input
          id="test-utterance"
          value={utterance}
          onChange={(e) => setUtterance(e.target.value)}
          data-testid="voice-test-utterance"
        />
        <Button type="button" variant="secondary" onClick={runParseTest} disabled={pending}>
          Preview parse
        </Button>
        {parseResult ? (
          <p className="text-sm text-muted-foreground" data-testid="voice-parse-preview">
            {parseResult}
          </p>
        ) : null}
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
