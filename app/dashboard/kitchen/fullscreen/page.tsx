import { redirect } from "next/navigation";

export default function KitchenFullscreenRedirectPage() {
  redirect("/dashboard/kitchen?fullscreen=1");
}
