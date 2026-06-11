/**
 * Pure helpers for hardware compatibility center diagnostics.
 */

export type NetworkDiagnosticResult = {
  online: boolean;
  healthOk: boolean;
  latencyMs: number | null;
  status: "pass" | "warn" | "fail";
  message: string;
};

export type KdsConnectivityResult = {
  kitchenRouteReachable: boolean;
  latencyMs: number | null;
  status: "pass" | "warn" | "fail";
  message: string;
};

export async function runNetworkDiagnostic(
  fetchFn: typeof fetch = fetch,
  healthPath = "/api/health",
): Promise<NetworkDiagnosticResult> {
  const online = typeof navigator !== "undefined" ? navigator.onLine : true;

  if (!online) {
    return {
      online: false,
      healthOk: false,
      latencyMs: null,
      status: "fail",
      message: "Device reports offline — POS sync and KDS refresh will queue until reconnect.",
    };
  }

  const started = Date.now();
  try {
    const response = await fetchFn(healthPath, { cache: "no-store" });
    const latencyMs = Date.now() - started;
    const healthOk = response.ok;

    if (!healthOk) {
      return {
        online: true,
        healthOk: false,
        latencyMs,
        status: "fail",
        message: `Health endpoint returned ${response.status} — verify deployment or VPN.`,
      };
    }

    if (latencyMs > 2000) {
      return {
        online: true,
        healthOk: true,
        latencyMs,
        status: "warn",
        message: `Health OK but slow (${latencyMs}ms) — typical rush-hour target is under 500ms.`,
      };
    }

    return {
      online: true,
      healthOk: true,
      latencyMs,
      status: "pass",
      message: `Network OK — health responded in ${latencyMs}ms.`,
    };
  } catch {
    return {
      online: true,
      healthOk: false,
      latencyMs: null,
      status: "fail",
      message: "Could not reach /api/health — check Wi-Fi, firewall, or ad-blocker.",
    };
  }
}

export async function runKdsConnectivityCheck(
  fetchFn: typeof fetch = fetch,
  kitchenPath = "/dashboard/kitchen",
): Promise<KdsConnectivityResult> {
  const started = Date.now();
  try {
    const response = await fetchFn(kitchenPath, {
      method: "HEAD",
      cache: "no-store",
      redirect: "manual",
    });
    const latencyMs = Date.now() - started;
    const reachable = response.status === 200 || response.status === 307 || response.status === 302;

    if (!reachable) {
      return {
        kitchenRouteReachable: false,
        latencyMs,
        status: "fail",
        message: `Kitchen route returned ${response.status} — verify auth session or deployment.`,
      };
    }

    if (latencyMs > 3000) {
      return {
        kitchenRouteReachable: true,
        latencyMs,
        status: "warn",
        message: `KDS route reachable but slow (${latencyMs}ms) — verify tablet Wi-Fi signal.`,
      };
    }

    return {
      kitchenRouteReachable: true,
      latencyMs,
      status: "pass",
      message: `KDS route reachable (${latencyMs}ms) — open /dashboard/kitchen on kitchen display.`,
    };
  } catch {
    return {
      kitchenRouteReachable: false,
      latencyMs: null,
      status: "fail",
      message: "Could not reach kitchen route — run network diagnostic first.",
    };
  }
}

export function buildPrinterTestHtml(): string {
  return `<!DOCTYPE html><html><head><title>OS Kitchen printer test</title>
<style>body{font-family:system-ui;padding:24px;max-width:320px;margin:0 auto}
h1{font-size:18px}p{font-size:12px;color:#444}</style></head><body>
<h1>OS Kitchen — printer test</h1>
<p>If this page prints on your receipt printer, browser print path works.</p>
<p>${new Date().toLocaleString()}</p>
<script>window.onload=function(){window.print();}</script></body></html>`;
}

export const CASH_DRAWER_TEST_STATUS = {
  id: "cash_drawer_manual",
  status: "placeholder" as const,
  message:
    "Auto kick via receipt printer pulse is not wired — open drawer manually and confirm staff workflow.",
} as const;
