import { PlaybooksSubnav } from "@/components/dashboard/playbooks/playbooks-subnav";

export default function PlaybooksLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PlaybooksSubnav />
      {children}
    </div>
  );
}
