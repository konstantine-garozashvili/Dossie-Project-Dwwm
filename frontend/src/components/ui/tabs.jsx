import React from "react";
import { cn } from "@/lib/utils";

const Tabs = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("", className)}
      {...props}
    />
  );
});
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-slate-700/20 p-1 text-slate-400",
        className
      )}
      {...props}
    />
  );
});
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent }; 