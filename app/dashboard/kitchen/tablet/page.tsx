import { redirect } from "next/navigation";

/** Bookmark-friendly alias for tablet KDS — fullscreen board lives on the kitchen route. */
export default function KitchenTabletAliasPage() {
  redirect("/dashboard/kitchen/fullscreen");
}
