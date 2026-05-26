/** Validates Slack / HTTP webhook URL for edge sync DLQ alerts. */
export function parseDlqWebhookUrl(raw: string | undefined): { ok: true; url: string } | { ok: false; reason: string } {
  const url = raw?.trim();
  if (!url) {
    return { ok: false, reason: "STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL is not set." };
  }
  if (url === "..." || url.includes("...") || url.startsWith("http://...")) {
    return {
      ok: false,
      reason:
        'Placeholder URL detected. Use a full URL, e.g. https://hooks.slack.com/services/T000/B000/XXXX',
    };
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { ok: false, reason: `Unsupported protocol: ${parsed.protocol}` };
    }
    return { ok: true, url: parsed.toString() };
  } catch {
    return { ok: false, reason: "Not a valid URL." };
  }
}
