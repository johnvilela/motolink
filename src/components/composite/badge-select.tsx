"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

export interface BadgeSelectOption {
  value: string;
  label: string;
}

type BadgeSelectBaseProps = {
  options: BadgeSelectOption[];
  disabled?: boolean;
  error?: boolean;
  className?: string;
};

type BadgeSelectSingleProps = BadgeSelectBaseProps & {
  multiple?: false;
  value: string | null;
  onChange: (value: string | null) => void;
};

type BadgeSelectMultipleProps = BadgeSelectBaseProps & {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

export type BadgeSelectProps =
  | BadgeSelectSingleProps
  | BadgeSelectMultipleProps;

export function BadgeSelect({
  options,
  disabled = false,
  error = false,
  className,
  ...props
}: BadgeSelectProps) {
  const selectedValues = props.multiple
    ? props.value
    : props.value
      ? [props.value]
      : [];

  const handleToggle = (optionValue: string) => {
    if (disabled) return;

    if (props.multiple) {
      const nextValue = selectedValues.includes(optionValue)
        ? selectedValues.filter((value) => value !== optionValue)
        : [...selectedValues, optionValue];
      props.onChange(nextValue);
      return;
    }

    const nextValue = selectedValues.includes(optionValue) ? null : optionValue;
    props.onChange(nextValue);
  };

  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      aria-invalid={error || undefined}
      data-invalid={error || undefined}
    >
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        return (
          <Badge
            key={option.value}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "select-none",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            )}
            onClick={() => handleToggle(option.value)}
            aria-pressed={isSelected}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(event) => {
              if (disabled) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleToggle(option.value);
              }
            }}
          >
            {option.label}
          </Badge>
        );
      })}
    </div>
  );
}
