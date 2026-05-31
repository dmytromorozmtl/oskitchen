function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** GET handler for email approval links — shows a confirm form (POST mutates state). */
export function experimentApproveConfirmHtml(input: {
  title: string;
  description: string;
  actionPath: string;
  hiddenFields: Record<string, string>;
  submitLabel: string;
}): Response {
  const fields = Object.entries(input.hiddenFields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" />`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 32rem; margin: 4rem auto; padding: 0 1rem; color: #0f172a; }
    p { color: #475569; line-height: 1.5; }
    button { margin-top: 1rem; padding: 0.625rem 1.25rem; background: #FF5F1F; color: #fff; border: 0; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <h1>${escapeHtml(input.title)}</h1>
  <p>${escapeHtml(input.description)}</p>
  <form method="POST" action="${escapeHtml(input.actionPath)}">
    ${fields}
    <button type="submit">${escapeHtml(input.submitLabel)}</button>
  </form>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function readApprovalToken(request: Request): Promise<string | null> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as { token?: string } | null;
    return body?.token?.trim() ?? null;
  }
  const fd = await request.formData().catch(() => null);
  if (!fd) return null;
  return String(fd.get("token") ?? "").trim() || null;
}
