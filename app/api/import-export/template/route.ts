import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { buildTemplateCsv, isTemplateKind } from "@/lib/import-export/template-definitions";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  if (!kind || !isTemplateKind(kind)) {
    return NextResponse.json({ error: "Invalid template kind" }, { status: 400 });
  }

  const { filename, body } = buildTemplateCsv(kind);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
