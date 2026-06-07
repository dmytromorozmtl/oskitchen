import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("Tooltip", Tooltip);
export default meta;

export const IconHint = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Sync status">
            ?
          </Button>
        </TooltipTrigger>
        <TooltipContent>Last sync 2 minutes ago</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
