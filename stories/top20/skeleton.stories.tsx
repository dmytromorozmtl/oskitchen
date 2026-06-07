import { Skeleton } from "@/components/ui/skeleton";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("Skeleton", Skeleton);
export default meta;

export const Pulse = {
  render: () => (
    <div className="w-[320px] space-y-3">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  ),
};
