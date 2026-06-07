import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("PageHeader", PageHeader);
export default meta;

export const WithActions = {
  args: {
    title: "Order hub",
    description: "Unified queue across POS, delivery, and storefront channels.",
    actions: (
      <>
        <Button variant="outline">Export</Button>
        <Button>New order</Button>
      </>
    ),
  },
};
