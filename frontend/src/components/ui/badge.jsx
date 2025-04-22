import React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}) {
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-800/80",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    destructive: "bg-red-500 text-slate-50 hover:bg-red-500/80",
    outline: "text-slate-950 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-50"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-slate-300",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 