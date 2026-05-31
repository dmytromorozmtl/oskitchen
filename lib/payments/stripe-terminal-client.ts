import type { Reader, Terminal } from "@stripe/terminal-js/types/terminal";

/** Client-side reader connection status (Stripe Terminal.js). */
export type StripeTerminalReaderStatus =
  | "disconnected"
  | "connecting"
  | "online"
  | "offline"
  | "busy"
  | "processing";

export type StripeTerminalPaymentResult = {
  paymentIntentId: string;
  transaction: unknown;
};

export function mapReaderStatus(params: {
  connected: boolean;
  processing: boolean;
  readerStatus?: string | null;
}): StripeTerminalReaderStatus {
  if (params.processing) return "processing";
  if (!params.connected) return "disconnected";
  const raw = params.readerStatus?.toLowerCase() ?? "online";
  if (raw === "offline") return "offline";
  if (raw === "busy") return "busy";
  return "online";
}

export function useSimulatedTerminalReaders(): boolean {
  if (typeof process === "undefined") return false;
  const flag = process.env.NEXT_PUBLIC_STRIPE_TERMINAL_SIMULATED?.trim().toLowerCase();
  return flag === "true" || flag === "1" || flag === "yes";
}

export async function fetchTerminalConnectionToken(): Promise<string> {
  const res = await fetch("/api/pos/terminal");
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Could not fetch Terminal connection token");
  }
  const { token } = (await res.json()) as { token?: string };
  if (!token?.trim()) throw new Error("Terminal connection token missing");
  return token;
}

export async function createTerminalPaymentIntentViaApi(params: {
  amount: number;
  orderId: string;
  currency?: string;
}): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const res = await fetch("/api/pos/terminal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: params.amount,
      orderId: params.orderId,
      currency: params.currency ?? "usd",
    }),
  });
  const payload = (await res.json()) as {
    clientSecret?: string;
    paymentIntentId?: string;
    error?: string;
  };
  if (!res.ok || !payload.clientSecret || !payload.paymentIntentId) {
    throw new Error(payload.error ?? "Could not start Terminal payment");
  }
  return {
    clientSecret: payload.clientSecret,
    paymentIntentId: payload.paymentIntentId,
  };
}

export async function captureTerminalPaymentViaApi(params: {
  paymentIntentId: string;
  orderId: string;
}): Promise<unknown> {
  const res = await fetch("/api/pos/terminal", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paymentIntentId: params.paymentIntentId,
      orderId: params.orderId,
    }),
  });
  const data = (await res.json()) as { transaction?: unknown; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to record Terminal payment");
  }
  return data.transaction;
}

export async function discoverTerminalReaders(
  terminal: Terminal,
  simulated = useSimulatedTerminalReaders(),
): Promise<Reader[]> {
  const result = await terminal.discoverReaders({ simulated });
  if ("error" in result && result.error) {
    throw new Error(result.error.message);
  }
  return result.discoveredReaders ?? [];
}

export async function connectTerminalReader(
  terminal: Terminal,
  reader: Reader,
): Promise<Reader> {
  const result = await terminal.connectReader(reader);
  if ("error" in result && result.error) {
    throw new Error(result.error.message);
  }
  return result.reader;
}

export async function disconnectTerminalReader(terminal: Terminal): Promise<void> {
  await terminal.disconnectReader();
}

export async function processTerminalCardPayment(params: {
  terminal: Terminal;
  amount: number;
  orderId: string;
  currency?: string;
}): Promise<StripeTerminalPaymentResult> {
  const { clientSecret, paymentIntentId } = await createTerminalPaymentIntentViaApi({
    amount: params.amount,
    orderId: params.orderId,
    currency: params.currency,
  });

  const collectResult = await params.terminal.collectPaymentMethod(clientSecret);
  if ("error" in collectResult && collectResult.error) {
    throw new Error(collectResult.error.message);
  }

  const processResult = await params.terminal.processPayment(collectResult.paymentIntent);
  if ("error" in processResult && processResult.error) {
    throw new Error(processResult.error.message);
  }

  const transaction = await captureTerminalPaymentViaApi({
    paymentIntentId: processResult.paymentIntent.id ?? paymentIntentId,
    orderId: params.orderId,
  });

  return {
    paymentIntentId: processResult.paymentIntent.id ?? paymentIntentId,
    transaction,
  };
}

export function nextReconnectDelayMs(attempt: number): number {
  return Math.min(15_000, 1_000 * 2 ** Math.max(0, attempt));
}
