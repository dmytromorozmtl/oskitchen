import { CopilotSubnav } from "@/components/dashboard/copilot/copilot-subnav";

export default function CopilotLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <CopilotSubnav />
      {children}
    </div>
  );
}
