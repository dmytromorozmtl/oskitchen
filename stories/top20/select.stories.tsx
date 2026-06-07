import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("Select", Select);
export default meta;

export const Location = {
  render: () => (
    <Select defaultValue="main">
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Location" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="main">Main kitchen</SelectItem>
        <SelectItem value="commissary">Commissary</SelectItem>
      </SelectContent>
    </Select>
  ),
};
