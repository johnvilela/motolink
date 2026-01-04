import type * as React from "react";

import { classHelper } from "@/lib/utils/class-helper";
import { Label } from "./label";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  label?: string;
  divClassName?: string;
  error?: string;
}

function Textarea({
  label,
  divClassName,
  error,
  className,
  name,
  ...props
}: TextareaProps) {
  return (
    <div className={classHelper("w-full", divClassName)}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <textarea
        data-slot="textarea"
        id={name}
        name={name}
        className={classHelper(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export { Textarea };
