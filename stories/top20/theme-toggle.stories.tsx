import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("ThemeToggle", ThemeToggle);
export default meta;

export const Default = {
  render: () => (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeToggle />
    </ThemeProvider>
  ),
};
