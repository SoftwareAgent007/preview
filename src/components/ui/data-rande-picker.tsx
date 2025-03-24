import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { useQueryClient } from "react-query"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  value: DateRange
  onChange?: (date: DateRange) => void
  className?: string
  onClose?: () => void
}

export function DatePickerWithRange({
  className,
  value,
  onChange,
  onClose,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange>(value)
  const queryClient = useQueryClient()

  const handleDateChange = (newDate: DateRange | undefined) => {
    if (!newDate) return
    setDate(newDate)
    onChange?.(newDate)
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      queryClient.invalidateQueries()
      onClose?.()
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover onOpenChange={handleClose}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto z-50 p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            className="[&_.rdp-day_button[aria-selected]]:bg-primary [&_.rdp-day_button[aria-selected]]:text-primary-foreground bg-white"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}