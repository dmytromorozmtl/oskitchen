import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("Switch", Switch);
export default meta;

export const OfflineQueue = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="offline-queue" defaultChecked />
      <Label htmlFor="offline-queue">Queue sales when offline</Label>
    </div>
  ),
};
