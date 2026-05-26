export type EmailFlowId = "welcome" | "abandoned_cart" | "post_purchase" | "win_back";

const KLAVIYO_BASE = "https://a.klaviyo.com/api";

export function isKlaviyoConfigured(): boolean {
  return Boolean(process.env.KLAVIYO_API_KEY?.trim());
}

export async function triggerKlaviyoFlow(
  flow: EmailFlowId,
  email: string,
  properties?: Record<string, string | number>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.KLAVIYO_API_KEY?.trim();
  if (!key) return { ok: false, error: "KLAVIYO_API_KEY not set" };

  const metricMap: Record<EmailFlowId, string> = {
    welcome: "KitchenOS Welcome",
    abandoned_cart: "KitchenOS Abandoned Cart",
    post_purchase: "KitchenOS Post Purchase",
    win_back: "KitchenOS Win Back",
  };

  const res = await fetch(`${KLAVIYO_BASE}/events/`, {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${key}`,
      "Content-Type": "application/json",
      revision: "2024-10-15",
    },
    body: JSON.stringify({
      data: {
        type: "event",
        attributes: {
          metric: { data: { type: "metric", attributes: { name: metricMap[flow] } } },
          profile: { data: { type: "profile", attributes: { email } } },
          properties: properties ?? {},
        },
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `Klaviyo ${res.status}` };
  }
  return { ok: true };
}

export async function listEmailCampaignFlows(): Promise<
  { id: EmailFlowId; label: string; configured: boolean }[]
> {
  const configured = isKlaviyoConfigured();
  return [
    { id: "welcome", label: "Welcome email", configured },
    { id: "abandoned_cart", label: "Abandoned cart", configured },
    { id: "post_purchase", label: "Post-purchase", configured },
    { id: "win_back", label: "Win-back", configured },
  ];
}
