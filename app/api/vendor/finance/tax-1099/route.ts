import { NextResponse } from "next/server";

import { hasPermission } from "@/lib/permissions/guards";
import { resolveVendorCabinetAccess } from "@/lib/marketplace/vendor-page-access";
import {
  buildVendor1099Html,
  loadVendor1099Summary,
} from "@/services/marketplace/vendor-finance-service";

export async function GET(request: Request) {
  const access = await resolveVendorCabinetAccess();

  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const canRead =
    hasPermission(access.actor.granted, "vendor:analytics:read") ||
    hasPermission(access.actor.granted, "vendor:cabinet:access") ||
    (access.actor.workspaceRole === "OWNER" &&
      hasPermission(access.actor.granted, "marketplace:read"));

  if (!canRead) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const yearRaw = url.searchParams.get("year");
  const taxYear = yearRaw ? Number(yearRaw) : new Date().getFullYear();

  if (!Number.isFinite(taxYear) || taxYear < 2000 || taxYear > 2100) {
    return NextResponse.json({ error: "Invalid tax year" }, { status: 400 });
  }

  const summary = await loadVendor1099Summary(access.vendorId, taxYear);
  if (!summary) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const html = buildVendor1099Html(summary);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="1099-k-summary-${taxYear}.html"`,
    },
  });
}
