import { OnboardingHubView } from "@/components/dashboard/onboarding-hub/onboarding-hub-view";

export const metadata = {
  title: "Onboarding Hub",
  description: "Single entry for Launch Wizard, Quick Start, Go-live, and Implementation setup.",
};

export default function OnboardingHubPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <OnboardingHubView />
    </div>
  );
}
