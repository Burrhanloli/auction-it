import { cn } from "@repo/ui/lib/utils";
import * as React from "react";

function InputOTPSeparator({ className, ...props }: React.ComponentProps<"hr">) {
  return (
    <hr
      data-slot="input-otp-separator"
      className={cn("mx-2 w-4 border-t-2 border-foreground", className)}
      {...props}
    />
  );
}

export { InputOTPSeparator };
