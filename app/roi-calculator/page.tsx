import { PublicShell } from "@/components/marketing/public-page";
import { RoiCalculator } from "@/components/marketing/roi-calculator";

export const metadata = {
  title: "KitchenOS ROI calculator",
  description: "Estimate hours saved, cost savings, and plan fit for food operations.",
};

export default function RoiCalculatorPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-16 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">ROI calculator</h1>
          <p className="mt-2 text-muted-foreground">
            Estimate potential savings from fewer manual coordination hours, fewer packing mistakes, and better production planning.
            Results are conservative estimates, not guaranteed outcomes.
          </p>
        </div>
        <RoiCalculator />
      </main>
    </PublicShell>
  );
}
