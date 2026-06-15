import { REDACTION_PATTERN_GROUPS } from "@/lib/security/redaction-patterns";

export type RedactionOptions = {
  /** When true, mask simple email-like substrings (can remove operational context). Default false. */
  redactEmail?: boolean;
  /** When true, mask digit runs that look like phone numbers. Default false. */
  redactPhone?: boolean;
};

/**
 * Display-time redaction for errors, logs, and diagnostics. Does not mutate stored DB values.
 */
export function redactSensitiveText(input: string | null | undefined, options?: RedactionOptions): string {
  if (input == null) return "";
  let s = String(input);

  for (const { pattern, replacement } of REDACTION_PATTERN_GROUPS) {
    s = s.replace(pattern, replacement);
  }

  if (options?.redactEmail) {
    s = s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]");
  }
  if (options?.redactPhone) {
    s = s.replace(/\b\+?\d[\d\s().-]{8,}\b/g, "[REDACTED_PHONE]");
  }

  return s;
}

export type SafeErrorPreview = {
  text: string;
  redacted: boolean;
};

/**
 * Redact then truncate for UI. Compares length/heuristic to detect redaction when patterns shorten aggressively.
 */
export function toSafeErrorPreview(
  input: string | null | undefined,
  maxLength = 160,
  options?: RedactionOptions,
): SafeErrorPreview {
  const raw = input == null ? "" : String(input);
  const redactedFull = redactSensitiveText(raw, options);
  const patternHit = redactedFull !== raw;
  let text = redactedFull.replace(/\s+/g, " ").trim();
  if (text.length > maxLength) {
    text = text.slice(0, maxLength - 1) + "…";
  }
  return { text: text || "—", redacted: patternHit || redactedFull.length < raw.length };
}
