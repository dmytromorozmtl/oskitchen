import type { StaffCertificationStatus, StaffShiftStatus, StaffStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import {
  CERT_STATUS_LABEL, CERT_STATUS_TONE,
  SHIFT_STATUS_LABEL, SHIFT_STATUS_TONE, STAFF_STATUS_TONE,
} from "@/lib/staff/staff-status";
import { STAFF_STATUS_LABEL } from "@/lib/staff/staff-types";

const TONE_CLASS: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-sky-100 text-sky-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

export function StaffStatusBadge({ status }: { status: StaffStatus }) {
  return <Badge className={TONE_CLASS[STAFF_STATUS_TONE[status]]}>{STAFF_STATUS_LABEL[status]}</Badge>;
}

export function ShiftStatusBadge({ status }: { status: StaffShiftStatus }) {
  return <Badge className={TONE_CLASS[SHIFT_STATUS_TONE[status]]}>{SHIFT_STATUS_LABEL[status]}</Badge>;
}

export function CertStatusBadge({ status }: { status: StaffCertificationStatus }) {
  return <Badge className={TONE_CLASS[CERT_STATUS_TONE[status]]}>{CERT_STATUS_LABEL[status]}</Badge>;
}
