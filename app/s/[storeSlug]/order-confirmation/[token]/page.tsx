import { redirect } from "next/navigation";

export default async function StorefrontConfirmationRedirect({
  params,
}: {
  params: Promise<{ storeSlug: string; token: string }>;
}) {
  const { storeSlug, token } = await params;
  redirect(`/s/${storeSlug}/order/${token}`);
}
