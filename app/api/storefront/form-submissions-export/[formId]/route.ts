import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function esc(v: unknown): string {
  const s = typeof v === "string" ? v : JSON.stringify(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ formId: string }> }) {
  const user = await requireSessionUser();
  const { formId } = await params;
  const form = await prisma.storefrontForm.findFirst({
    where: { id: formId, storefront: { userId: user.id } },
    include: {
      submissions: { orderBy: { createdAt: "desc" }, take: 2000 },
    },
  });
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const keys = new Set<string>();
  for (const s of form.submissions) {
    const p = s.payloadJson as Record<string, unknown>;
    for (const k of Object.keys(p)) {
      if (!k.startsWith("_")) keys.add(k);
    }
  }
  const cols = ["id", "createdAt", "status", ...Array.from(keys).sort()];
  const lines = [cols.join(",")];
  for (const s of form.submissions) {
    const p = (s.payloadJson as Record<string, unknown>) ?? {};
    const row = cols.map((c) => {
      if (c === "id") return esc(s.id);
      if (c === "createdAt") return esc(s.createdAt.toISOString());
      if (c === "status") return esc(s.status);
      return esc(p[c] ?? "");
    });
    lines.push(row.join(","));
  }
  const csv = lines.join("\n");
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="form-${form.slug}-submissions.csv"`,
    },
  });
}
