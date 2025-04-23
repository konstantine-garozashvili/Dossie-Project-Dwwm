import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-full p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "w-full space-y-4",
        caption: "flex justify-center pt-1 relative items-center px-8",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full",
        head_cell: "w-[14.28%] text-slate-500 rounded-md font-normal text-[0.8rem] text-center",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-cyan-500/5",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          "hover:bg-cyan-500/20 hover:text-white",
          "focus:bg-cyan-500/20 focus:text-white focus:relative focus:z-20",
          "data-[selected]:bg-cyan-500 data-[selected]:text-white",
          "disabled:pointer-events-none disabled:opacity-50",
          "w-full rounded-md"
        ),
        day_selected: cn(
          "bg-cyan-500 text-white",
          "hover:bg-cyan-600 hover:text-white",
          "focus:bg-cyan-500 focus:text-white"
        ),
        day_today: "bg-cyan-500/20 text-cyan-400",
        day_outside: cn(
          "text-slate-500 opacity-50",
          "aria-selected:bg-slate-100/50 aria-selected:text-slate-500 aria-selected:opacity-30"
        ),
        day_disabled: "text-slate-500 opacity-50",
        day_hidden: "invisible",
        day_range_start: "rounded-l-md",
        day_range_end: "rounded-r-md",
        day_range_middle: "rounded-none",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };