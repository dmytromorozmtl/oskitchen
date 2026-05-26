import { TemplatesSubnav } from "@/components/dashboard/templates/templates-subnav";

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <TemplatesSubnav />
      {children}
    </div>
  );
}
