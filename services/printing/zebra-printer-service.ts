export type LabelPrinterVendor = "zebra" | "dymo" | "epson";

export type LabelPrintInput = {
  vendor: LabelPrinterVendor;
  title: string;
  sku?: string;
  barcode?: string;
  quantity?: number;
};

function escapeZpl(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\^/g, "");
}

export function buildZplLabel(input: LabelPrintInput): string {
  const title = escapeZpl(input.title.slice(0, 40));
  const sku = input.sku ? escapeZpl(input.sku.slice(0, 24)) : "";
  const qty = input.quantity ?? 1;
  return `^XA^FO50,50^A0N,40,40^FD${title}^FS${sku ? `^FO50,100^A0N,28,28^FD${sku}^FS` : ""}^FO50,150^BQN,2,6^FDQA,${input.barcode ?? input.sku ?? "NOLABEL"}^FS^PQ${qty}^XZ`;
}

export function buildDymoLabelXml(input: LabelPrintInput): string {
  return `<?xml version="1.0"?><DieCutLabel><TextObject><Name>Title</Name><Text>${input.title}</Text></TextObject></DieCutLabel>`;
}

export function buildEscPosLabel(input: LabelPrintInput): Uint8Array {
  const lines = [`\x1B@\n${input.title}\n`, input.sku ? `${input.sku}\n` : "", "\n\x1DV\x00"];
  return new TextEncoder().encode(lines.join(""));
}

export async function sendLabelToPrinter(
  input: LabelPrintInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const zebraIp = process.env.ZEBRA_PRINTER_IP;
  const dymoIp = process.env.DYMO_PRINTER_IP;

  let payload: string | Uint8Array;
  let host: string | undefined;

  switch (input.vendor) {
    case "zebra":
      payload = buildZplLabel(input);
      host = zebraIp;
      break;
    case "dymo":
      payload = buildDymoLabelXml(input);
      host = dymoIp;
      break;
    case "epson":
      payload = buildEscPosLabel(input);
      host = zebraIp;
      break;
    default:
      return { ok: false, error: "Unsupported vendor" };
  }

  if (!host) {
    return { ok: false, error: `${input.vendor} printer IP not configured` };
  }

  try {
    const body = typeof payload === "string" ? payload : Buffer.from(payload);
    const res = await fetch(`http://${host}:9100`, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false, error: `Printer returned ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Printer unreachable" };
  }
}
