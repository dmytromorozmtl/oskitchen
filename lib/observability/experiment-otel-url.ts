export function experimentTraceUrl(traceId: string): string | null {
  const ddSite = process.env.DATADOG_SITE?.trim() || "datadoghq.com";
  const ddApp = process.env.DATADOG_APP_URL?.trim();
  if (ddApp) {
    return `${ddApp.replace(/\/$/, "")}/apm/traces?query=trace_id:${traceId}`;
  }
  if (process.env.DATADOG_API_KEY?.trim()) {
    return `https://app.${ddSite}/apm/traces?query=trace_id:${traceId}`;
  }
  const honeycomb = process.env.HONEYCOMB_APP_URL?.trim();
  if (honeycomb) {
    return `${honeycomb.replace(/\/$/, "")}?trace_id=${traceId}`;
  }
  return null;
}
