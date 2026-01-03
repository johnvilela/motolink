import type { ComponentProps } from "react";
import { classHelper } from "@/lib/utils/class-helper";
import { Label } from "./label";

interface InputProps extends ComponentProps<"input"> {
  error?: string;
  label?: string;
  divClassName?: string;
}

function Textfield({
  className,
  type,
  label,
  name,
  error,
  divClassName,
  ...props
}: InputProps) {
  return (
    <div className={classHelper("w-full max-w-sm", divClassName)}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <input
        id={name}
        name={name}
        type={type}
        data-slot="input"
        className={classHelper(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export { Textfield };
