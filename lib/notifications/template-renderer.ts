import { getSystemTemplate, type SystemTemplate } from "@/lib/notifications/template-registry";

export type TemplateVariables = Record<string, string | number | null | undefined>;

export type RenderResult = {
  subject: string;
  html: string;
  text: string;
  missingVariables: string[];
  warnings: string[];
};

const VAR_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/**
 * Variable interpolation with HTML escaping for HTML output and no
 * escaping for text/subject. Unknown variables are kept blank and
 * reported in `missingVariables`. No JavaScript / template-string
 * evaluation is performed.
 */
function interpolate(input: string, vars: TemplateVariables, mode: "html" | "plain"): { out: string; missing: string[] } {
  const missing: string[] = [];
  const out = input.replace(VAR_PATTERN, (_match, key: string) => {
    const v = vars[key];
    if (v === undefined || v === null || v === "") {
      missing.push(key);
      return "";
    }
    const s = String(v);
    return mode === "html" ? escapeHtml(s) : s;
  });
  return { out, missing };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type RenderInput = {
  templateKey: string;
  variables: TemplateVariables;
  /** Optional per-workspace overrides for subject / bodyHtml / bodyText. */
  overrides?: Partial<Pick<SystemTemplate, "subject" | "bodyHtml" | "bodyText">>;
};

export function renderTemplate(input: RenderInput): RenderResult | null {
  const tpl = getSystemTemplate(input.templateKey);
  if (!tpl) return null;
  const subjectRaw = input.overrides?.subject ?? tpl.subject;
  const htmlRaw = input.overrides?.bodyHtml ?? tpl.bodyHtml;
  const textRaw = input.overrides?.bodyText ?? tpl.bodyText;

  const subjectR = interpolate(subjectRaw, input.variables, "plain");
  const textR = interpolate(textRaw, input.variables, "plain");
  const htmlR = interpolate(htmlRaw, input.variables, "html");

  const missing = Array.from(new Set([...subjectR.missing, ...textR.missing, ...htmlR.missing]));
  const requiredMissing = tpl.variables
    .filter((v) => v.required)
    .map((v) => v.key)
    .filter((k) => missing.includes(k));

  const warnings: string[] = [];
  if (requiredMissing.length) {
    warnings.push(`Missing required variables: ${requiredMissing.join(", ")}`);
  }
  if (subjectR.out.length > 200) {
    warnings.push("Subject exceeds 200 characters and may be truncated by some providers.");
  }
  if (/<script\b|javascript:/i.test(htmlRaw)) {
    warnings.push("Template HTML contains a script tag or javascript: URL — escaped on render.");
  }

  return {
    subject: subjectR.out.slice(0, 200),
    html: htmlR.out,
    text: textR.out,
    missingVariables: missing,
    warnings,
  };
}

export function previewTemplate(templateKey: string, vars: TemplateVariables = {}): RenderResult | null {
  const tpl = getSystemTemplate(templateKey);
  if (!tpl) return null;
  const filled: TemplateVariables = { ...vars };
  for (const v of tpl.variables) {
    if (filled[v.key] === undefined) filled[v.key] = v.example;
  }
  return renderTemplate({ templateKey, variables: filled });
}
