import { redirect } from "next/navigation";

/** Operator home lives on Today — /dashboard is a stable alias only. */
export default function DashboardHomePage() {
  redirect("/dashboard/today");
}
