"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/cn";

interface SelectSearchOption {
  value: string;
  label: string;
}

interface SelectSearchProps {
  options: SelectSearchOption[];
  placeholder?: string;
  paramName?: string;
  resetPageOnChange?: boolean;
  className?: string;
}

export function SelectSearch({
  options,
  placeholder = "Selecionar...",
  paramName = "status",
  resetPageOnChange = true,
  className,
}: SelectSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentValue = searchParams.get(paramName) ?? "";

  const updateURL = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== "all") {
        params.set(paramName, value);
      } else {
        params.delete(paramName);
      }

      if (resetPageOnChange) {
        params.delete("page");
      }

      const queryString = params.toString();
      const newURL = queryString ? `${pathname}?${queryString}` : pathname;

      router.push(newURL);
    },
    [searchParams, pathname, router, paramName, resetPageOnChange],
  );

  return (
    <Select value={currentValue || "all"} onValueChange={updateURL}>
      <SelectTrigger className={cn("min-w-40", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
