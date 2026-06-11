import { TrainingSubnav } from "@/components/dashboard/training/subnav";

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <TrainingSubnav />
      {children}
    </div>
  );
}
