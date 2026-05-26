"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function PushSubscribeButton() {
  const [status, setStatus] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function enablePush() {
    setLoading(true);
    setStatus(null);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("Push not supported in this browser.");
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus("Notification permission denied.");
        return;
      }
      const keyRes = await fetch("/api/notifications/push/vapid-public-key");
      const keyJson = (await keyRes.json()) as { publicKey?: string; ok?: boolean };
      if (!keyJson.publicKey) {
        setStatus("Server VAPID keys not configured.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyJson.publicKey),
      });
      const json = sub.toJSON();
      const res = await fetch("/api/notifications/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });
      if (!res.ok) throw new Error("save_failed");
      setStatus("Push notifications enabled for this device.");
    } catch {
      setStatus("Could not enable push — try again or use email alerts.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className="rounded-full"
        disabled={loading}
        onClick={() => void enablePush()}
      >
        {loading ? "Enabling…" : "Enable browser notifications"}
      </Button>
      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
