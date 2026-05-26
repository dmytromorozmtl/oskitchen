import { redirect } from "next/navigation";

export default function StorefrontReservationsRedirect() {
  redirect("/dashboard/reservations");
}
