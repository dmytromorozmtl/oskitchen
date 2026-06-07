import { PackageOpen } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("EmptyState", EmptyState);
export default meta;

export const Card = {
  args: {
    icon: PackageOpen,
    title: "No orders yet",
    description: "When tickets arrive from POS or delivery apps they appear here.",
    primaryLabel: "Open POS",
    primaryHref: "/dashboard/pos/terminal",
    showDemoLink: false,
  },
};
