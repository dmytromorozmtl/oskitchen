import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(tsx|mdx)"],
  addons: ["@storybook/addon-essentials"],
  framework: "@storybook/nextjs",
  staticDirs: ["../public"],
};

export default config;
