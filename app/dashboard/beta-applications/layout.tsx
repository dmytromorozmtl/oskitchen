import { assertBetaProgramAccess } from "@/lib/beta/beta-permissions";

export default async function BetaApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertBetaProgramAccess();
  return (
    <div className="mx-auto max-w-[min(1600px,calc(100vw-2rem))] space-y-6 px-2 pb-10 sm:px-4 lg:px-0">
      {children}
    </div>
  );
}
