import React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}) {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border border-border hover:bg-muted hover:text-foreground",
    success: "bg-green-600 text-white hover:bg-green-600/90 dark:bg-green-700 dark:hover:bg-green-700/90",
    pending: "bg-yellow-600 text-white hover:bg-yellow-600/90 dark:bg-yellow-700 dark:hover:bg-yellow-700/90"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 