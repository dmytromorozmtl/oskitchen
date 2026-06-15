"use client";

import { useState, useTransition } from "react";

import {
  registerStripeTerminalReaderAction,
  setDefaultStripeTerminalReaderAction,
  syncStripeTerminalReadersAction,
  unregisterStripeTerminalReaderAction,
} from "@/actions/stripe-terminal-hardware";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  RegisteredStripeReaderRecord,
  StripeTerminalDeviceCatalogEntry,
} from "@/lib/payments/stripe-terminal-hardware-types";
import { formatStripeTerminalDeviceLabel } from "@/lib/payments/stripe-terminal-hardware-types";

export function StripeTerminalHardwarePanel({
  initialReaders,
  catalog,
  stripeConfigured,
  stripeLocationId,
}: {
  initialReaders: RegisteredStripeReaderRecord[];
  catalog: StripeTerminalDeviceCatalogEntry[];
  stripeConfigured: boolean;
  stripeLocationId: string | null;
}) {
  const [readers, setReaders] = useState(initialReaders);
  const [deviceType, setDeviceType] = useState(catalog[0]?.type ?? "stripe_m2");
  const [registrationCode, setRegistrationCode] = useState("");
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refreshFromServer(next: RegisteredStripeReaderRecord[]) {
    setReaders(next);
  }

  function pairReader() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("registrationCode", registrationCode);
      fd.set("label", label || catalog.find((c) => c.type === deviceType)?.label || "POS reader");
      fd.set("deviceType", deviceType);
      const res = await registerStripeTerminalReaderAction(fd);
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      setReaders((prev) => [...prev.filter((r) => r.id !== res.data.reader.id), res.data.reader]);
      setRegistrationCode("");
      setMessage(`Paired ${res.data.reader.label} — open POS Terminal to take payments.`);
    });
  }

  function syncFromStripe() {
    startTransition(async () => {
      const res = await syncStripeTerminalReadersAction();
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      refreshFromServer(res.data.readers);
      setMessage(`Synced ${res.data.readers.length} reader(s) from Stripe.`);
    });
  }

  function removeReader(readerId: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("readerId", readerId);
      const res = await unregisterStripeTerminalReaderAction(fd);
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      setReaders((prev) => prev.filter((r) => r.id !== readerId));
      setMessage("Reader removed.");
    });
  }

  function makeDefault(readerId: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("readerId", readerId);
      const res = await setDefaultStripeTerminalReaderAction(fd);
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      setReaders((prev) => prev.map((r) => ({ ...r, isDefault: r.id === readerId })));
    });
  }

  return (
    <div className="space-y-6" data-testid="stripe-terminal-hardware-panel">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supported readers</CardTitle>
          <CardDescription>
            Register Stripe Reader M2, BBPOS WisePOS E, or Verifone P400 with a pairing code from the
            device screen.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {catalog.map((device) => (
            <div
              key={device.type}
              className="rounded-lg border p-3 text-sm"
              data-testid={`hardware-catalog-${device.type}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{device.label}</p>
                {device.recommended ? <Badge variant="secondary">Popular</Badge> : null}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{device.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">{device.connectivity}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pair a reader</CardTitle>
          <CardDescription>
            {stripeConfigured
              ? stripeLocationId
                ? `Stripe location ${stripeLocationId.slice(0, 12)}… is ready.`
                : "A Stripe Terminal location will be created on first pair."
              : "Stripe secret key missing — pairing works in production only."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Reader model</Label>
              <Select value={deviceType} onValueChange={(v) => setDeviceType(v as typeof deviceType)}>
                <SelectTrigger data-testid="hardware-device-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {catalog.map((d) => (
                    <SelectItem key={d.type} value={d.type}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Counter label</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Front counter"
                data-testid="hardware-reader-label"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Pairing code (from reader display)</Label>
            <Input
              value={registrationCode}
              onChange={(e) => setRegistrationCode(e.target.value)}
              placeholder="puppies-plug-could"
              autoComplete="off"
              data-testid="hardware-registration-code"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={pairReader}
              disabled={pending || !stripeConfigured || registrationCode.length < 6}
              data-testid="hardware-pair-button"
            >
              Pair reader
            </Button>
            <Button type="button" variant="outline" onClick={syncFromStripe} disabled={pending || !stripeConfigured}>
              Sync from Stripe
            </Button>
          </div>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Paired readers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {readers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No readers paired yet.</p>
          ) : (
            readers.map((reader) => (
              <div
                key={reader.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                data-testid="hardware-reader-row"
              >
                <div>
                  <p className="font-medium">
                    {reader.label}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({formatStripeTerminalDeviceLabel(reader.deviceType)})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {reader.stripeReaderId ? `Stripe ${reader.stripeReaderId}` : "Pending"}
                    {reader.serialNumber ? ` · SN ${reader.serialNumber}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={reader.status === "online" ? "default" : "outline"}>
                    {reader.status}
                  </Badge>
                  {reader.isDefault ? <Badge variant="secondary">Default</Badge> : null}
                  {!reader.isDefault ? (
                    <Button type="button" size="sm" variant="outline" onClick={() => makeDefault(reader.id)}>
                      Set default
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeReader(reader.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
