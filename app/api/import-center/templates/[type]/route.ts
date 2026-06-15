import { NextResponse } from "next/server";

import { csvEscapeCell } from "@/lib/import-export/csv-format";
import { requireImportCenterApiAccess } from "@/lib/import-center/require-import-center-api";
import { IMPORT_TEMPLATES } from "@/lib/import-center/import-templates";
import type { ImportType } from "@prisma/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const access = await requireImportCenterApiAccess({
    capability: "import.templates",
    operation: "import_center.api.template_download",
  });
  if (!access.ok) return access.response;

  const { type } = await params;
  const importType = type as ImportType;
  const spec = IMPORT_TEMPLATES[importType];
  if (!spec) return NextResponse.json({ error: "Template not found" }, { status: 404 });
  const headers = spec.fields.map((f) => f.key);
  const sampleRow = headers.map((key) => spec.sampleRow[key] ?? "");
  const body = [headers.map(csvEscapeCell).join(","), sampleRow.map(csvEscapeCell).join(",")].join("\n") + "\n";
  return new NextResponse(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${importType.toLowerCase()}_template.csv"`,
    },
  });
}
