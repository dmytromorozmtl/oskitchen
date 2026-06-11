import { DeveloperSidebar } from "@/components/developer/developer-sidebar";

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-8 lg:px-8">
      <DeveloperSidebar />
      <div className="min-w-0 flex-1 space-y-8">{children}</div>
    </div>
  );
}
