import React from "react";
import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
      role="radiogroup"
    />
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-slate-200 border-slate-900 text-slate-900 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-slate-50",
        className
      )}
      {...props}
    >
      <span className="flex items-center justify-center" />
    </span>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem }; 