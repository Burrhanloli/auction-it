import { cn } from "@repo/ui/lib/utils";
import { OTPInput } from "input-otp";
import * as React from "react";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "cn-input-otp flex items-center has-disabled:opacity-50",
        containerClassName,
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

export { InputOTP };
export { InputOTPGroup } from "./input-otp-group";
export { InputOTPSlot } from "./input-otp-slot";
export { InputOTPSeparator } from "./input-otp-separator";
