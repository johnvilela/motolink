"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

interface SingleBadgeSelectOption {
  value: string;
  label: string;
}

interface SingleBadgeSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  options: SingleBadgeSelectOption[];
  className?: string;
}

export function SingleBadgeSelect({ value, onChange, options, className }: SingleBadgeSelectProps) {
  const toggle = useCallback(
    (optionValue: string) => {
      onChange(value === optionValue ? null : optionValue);
    },
    [value, onChange],
  );

  return (
    <div data-slot="single-badge-select" className={cn("flex flex-wrap gap-1", className)}>
      {options.map((option) => (
        <button key={option.value} type="button" onClick={() => toggle(option.value)}>
          <Badge variant={value === option.value ? "default" : "outline"} className="cursor-pointer">
            {option.label}
          </Badge>
        </button>
      ))}
    </div>
  );
}
