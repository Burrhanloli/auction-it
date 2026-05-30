import { cn } from "@repo/ui/lib/utils";
import React from "react";

export interface MStripeDividerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MStripeDivider({ className, ...props }: MStripeDividerProps) {
  return (
    <div
      className={cn("h-1 bg-linear-to-r from-m-blue-light via-m-blue-dark to-m-red", className)}
      {...props}
    />
  );
}
