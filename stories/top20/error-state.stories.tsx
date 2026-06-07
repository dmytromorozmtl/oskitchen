import { ErrorState } from "@/components/feedback/error-state";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("ErrorState", ErrorState);
export default meta;

export const Default = {
  args: {
    description: "We could not load today&apos;s briefing. Try again in a moment.",
    retryLabel: "Retry",
    onRetry: () => {},
  },
};
