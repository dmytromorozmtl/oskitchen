import type { Preview } from "@storybook/react";

import "../app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: {
      default: "dashboard",
      values: [
        { name: "dashboard", value: "hsl(var(--background))" },
        { name: "card", value: "hsl(var(--card))" },
      ],
    },
  },
};

export default preview;
