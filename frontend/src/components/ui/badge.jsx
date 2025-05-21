import React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}) {
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-800/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-700/80",
    destructive: "bg-red-600 text-slate-50 hover:bg-red-600/80",
    outline: "text-slate-950 border border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-300",
    success: "bg-green-600 text-white hover:bg-green-600/90",
    pending: "bg-slate-500 text-white hover:bg-slate-500/90"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-transparent dark:focus:ring-slate-300",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 