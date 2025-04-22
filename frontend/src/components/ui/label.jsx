import React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef(
  ({ className, htmlFor, ...props }, ref) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300",
          className
        )}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";

export { Label }; 