import { NextResponse } from "next/server";

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import {
  closedShiftCsvFilename,
  CLOSED_SHIFT_CSV_EXPORT_LIMIT,
  serializeClosedShiftSummariesToCsv,
} from "@/lib/pos/pos-shift-close-csv-era18";
import {
  logPosPermissionDenied,
  logPosShiftEvent,
} from "@/services/pos/pos-permission-audit";
import { listRecentClosedShiftSummaries } from "@/services/pos/pos-shift-service";

export async function GET() {
  const access = await requireMutationPermission("pos.shift.close");
  if (!access.ok) {
    await logPosPermissionDenied(access.actor, {
      requiredPermission: "pos.shift.close",
      operation: "pos.shift.export_csv",
      metadata: { route: "/api/pos/shifts/export" },
    });
    return NextResponse.json(
      { error: "You do not have permission to export shift closeouts." },
      { status: 403 },
    );
  }

  const shifts = await listRecentClosedShiftSummaries(
    access.actor.userId,
    CLOSED_SHIFT_CSV_EXPORT_LIMIT,
  );
  const csv = serializeClosedShiftSummariesToCsv(shifts);

  await logPosShiftEvent(access.actor, {
    action: AUDIT_ACTIONS.POS_SHIFT_CLOSEOUT_CSV_EXPORTED,
    label: "pos-shift-closeout-export",
    metadata: {
      rowCount: shifts.length,
      exportLimit: CLOSED_SHIFT_CSV_EXPORT_LIMIT,
    },
  });

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${closedShiftCsvFilename()}"`,
    },
  });
}
