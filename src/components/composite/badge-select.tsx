"use client";

import { ChevronDownIcon, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/cn";

interface BadgeSelectOption {
  value: string;
  label: string;
}

interface BadgeSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: BadgeSelectOption[];
  placeholder?: string;
  className?: string;
}

export function BadgeSelect({ value, onChange, options, placeholder = "Selecionar...", className }: BadgeSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(
    (optionValue: string) => {
      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    },
    [value, onChange],
  );

  const remove = useCallback(
    (optionValue: string) => {
      onChange(value.filter((v) => v !== optionValue));
    },
    [value, onChange],
  );

  const selectedLabels = options.filter((o) => value.includes(o.value));

  return (
    <div data-slot="badge-select" className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
          !value.length && "text-muted-foreground",
        )}
      >
        <span>{value.length > 0 ? `${value.length} selecionado${value.length > 1 ? "s" : ""}` : placeholder}</span>
        <ChevronDownIcon className="size-4 text-muted-foreground" />
      </button>

      {open && (
        <>
          {/** biome-ignore lint/a11y/noStaticElementInteractions: created by shadcn */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} onKeyDown={() => {}} role="presentation" />
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
              >
                <Checkbox checked={value.includes(option.value)} />
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}

      {selectedLabels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedLabels.map((option) => (
            <Badge key={option.value} variant="secondary" className="gap-1">
              {option.label}
              <button
                type="button"
                onClick={() => remove(option.value)}
                className="rounded-full hover:bg-muted-foreground/20"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
