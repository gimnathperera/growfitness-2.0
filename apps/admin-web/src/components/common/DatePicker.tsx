import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /**
   * Enable dropdown navigation for month and year selection.
   * Useful for birth dates where users need to navigate to past years easily.
   */
  enableYearMonthDropdown?: boolean;
  /**
   * Start month for date range (used with enableYearMonthDropdown).
   * Defaults to 100 years ago for birth dates.
   */
  startMonth?: Date;
  /**
   * End month for date range (used with enableYearMonthDropdown).
   * Defaults to today for birth dates.
   */
  endMonth?: Date;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = 'Pick a date',
  disabled,
  className,
  enableYearMonthDropdown = false,
  startMonth,
  endMonth,
}: DatePickerProps) {
  // For birth dates, set default range to 100 years ago to today
  const defaultStartMonth = enableYearMonthDropdown && !startMonth
    ? new Date(new Date().getFullYear() - 100, 0, 1)
    : startMonth;
  const defaultEndMonth = enableYearMonthDropdown && !endMonth
    ? new Date()
    : endMonth;

  // Set defaultMonth to the selected date's month/year, or use today if no date is selected
  const defaultMonth = date
    ? new Date(date.getFullYear(), date.getMonth(), 1)
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
          defaultMonth={defaultMonth}
          captionLayout={enableYearMonthDropdown ? 'dropdown' : 'label'}
          startMonth={defaultStartMonth}
          endMonth={defaultEndMonth}
        />
      </PopoverContent>
    </Popover>
  );
}
