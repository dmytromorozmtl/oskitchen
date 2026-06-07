import { PermissionDeniedCard } from "@/components/ui/permission-denied-card";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("PermissionDeniedCard", PermissionDeniedCard);
export default meta;

export const Finance = {
  args: {
    title: "Finance access required",
    description: "Ask an owner to grant reports.read before opening bank import.",
    primaryHref: "/dashboard/settings/team",
    primaryLabel: "Team settings",
    permissionKey: "reports.read",
  },
};
