import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("Card", Card);
export default meta;

export const Default = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Today&apos;s orders</CardTitle>
        <CardDescription>Live count across all channels.</CardDescription>
      </CardHeader>
      <CardContent className="text-2xl font-semibold tabular-nums">128</CardContent>
    </Card>
  ),
};
