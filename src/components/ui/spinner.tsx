import { Loader2Icon } from "lucide-react";

import { classHelper } from "@/lib/utils/class-helper";

function Spinner({ className, ...props }: React.ComponentProps<"output">) {
  return (
    <output
      aria-label="Loading"
      className={classHelper("size-4 animate-spin", className)}
      {...props}
    >
      <Loader2Icon />
    </output>
  );
}

export { Spinner };
