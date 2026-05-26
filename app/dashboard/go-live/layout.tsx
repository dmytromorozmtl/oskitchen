import { GoLiveSubnav } from "@/components/dashboard/go-live/subnav";

export default function GoLiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <GoLiveSubnav />
      {children}
    </div>
  );
}
