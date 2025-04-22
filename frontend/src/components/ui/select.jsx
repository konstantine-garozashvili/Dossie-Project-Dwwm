import React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className={cn("relative", className)}>
      <select
        className="w-full h-10 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white ring-offset-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        ref={ref}
        {...props}
      >
        {children}
      </select>
    </div>
  );
});
Select.displayName = "Select";

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("block truncate", className)}
      {...props}
    />
  );
});
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-700 bg-slate-800 text-white shadow-md animate-in fade-in-80",
        className
      )}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-700 focus:bg-slate-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-cyan-500" />
      </span>
      <span>{children}</span>
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }; 