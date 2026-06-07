import { Input } from "@/components/ui/input";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("Input", Input);
export default meta;

export const Default = { args: { placeholder: "Search menu items…", className: "w-[280px]" } };
