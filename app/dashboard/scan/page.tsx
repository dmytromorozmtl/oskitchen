import { redirect } from "next/navigation";

/** Shortcut from printed QR sheets — same UI as packing verification. */
export default function DashboardScanAliasPage() {
  redirect("/dashboard/packing/verify");
}
