import { MealPlansSubnav } from "@/components/dashboard/meal-plans-subnav";

export default function MealPlansLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <MealPlansSubnav />
      {children}
    </div>
  );
}
