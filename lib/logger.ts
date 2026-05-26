const isDev = process.env.NODE_ENV === "development";

/** Best-effort redaction for structured logs — never log raw credentials. */
export function redactForLog(input: unknown): unknown {
  if (typeof input === "string") {
    if (input.length > 256) return `[string ${input.length} chars]`;
    if (/^(sk_|rk_|whsec_|re_|Bearer\s+)/i.test(input.trim())) return "[redacted]";
    return input;
  }
  if (input instanceof Error) {
    return { name: input.name, message: input.message };
  }
  return input;
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.debug("[KitchenOS]", ...args.map(redactForLog));
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info("[KitchenOS]", ...args.map(redactForLog));
  },
  warn: (...args: unknown[]) => {
    console.warn("[KitchenOS]", ...args.map(redactForLog));
  },
  error: (...args: unknown[]) => {
    console.error("[KitchenOS]", ...args.map(redactForLog));
  },
};
