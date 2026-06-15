export type SlackBlock = { type: string; text?: { type: string; text: string } };

export async function postSlackWebhook(params: {
  webhookUrl: string;
  text: string;
  blocks?: SlackBlock[];
}): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(params.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: params.text,
      blocks: params.blocks,
    }),
  });
  return { ok: res.ok, status: res.status };
}

export function formatDailyOpsSlackMessage(report: {
  day: string;
  summary: { live: number; unhealthy: number };
  kitchens: Array<{ email: string; alerts: string[]; metrics: { ordersLast7d: number } }>;
}): string {
  const lines = [
    `*OS Kitchen Beta Daily Ops — ${report.day}*`,
    `Live: ${report.summary.live} · Unhealthy: ${report.summary.unhealthy}`,
    "",
  ];
  for (const k of report.kitchens) {
    const flag = k.alerts.length ? `⚠️` : "✅";
    lines.push(`${flag} ${k.email} — 7d orders: ${k.metrics.ordersLast7d}`);
    if (k.alerts.length) lines.push(`   _${k.alerts.join("; ")}_`);
  }
  return lines.join("\n");
}
