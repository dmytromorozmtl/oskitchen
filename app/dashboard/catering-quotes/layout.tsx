import { CateringQuotesSubnav } from "@/components/dashboard/catering-quotes-subnav";

export default function CateringQuotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <CateringQuotesSubnav />
      {children}
    </div>
  );
}
