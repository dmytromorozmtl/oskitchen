import * as React from "react";

import { cn } from "@/lib/utils";

export type RangeInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "min" | "max" | "step"
> & {
  min: number;
  max: number;
  step?: number;
  /** Overrides default numeric aria-valuetext when set. */
  valueText?: string;
};

export const RangeInput = React.forwardRef<HTMLInputElement, RangeInputProps>(
  (
    {
      className,
      min,
      max,
      step = 1,
      value,
      defaultValue,
      valueText,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      ...props
    },
    ref,
  ) => {
    const resolvedValue =
      typeof value === "number"
        ? value
        : typeof defaultValue === "number"
          ? defaultValue
          : min;

    const resolvedValueText = valueText ?? String(resolvedValue);

    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={resolvedValue}
        aria-valuetext={resolvedValueText}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
RangeInput.displayName = "RangeInput";
