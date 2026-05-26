import { redirect } from "next/navigation";

export default function SupportInboxPage() {
  redirect("/dashboard/support?tab=inbox");
}
