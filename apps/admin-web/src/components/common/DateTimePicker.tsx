import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  date?: Date | string;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({
  date,
  onSelect,
  placeholder = 'Pick a date and time',
  disabled,
  className,
}: DateTimePickerProps) {

  const getDateValue = (dateProp: Date | string | undefined): Date | undefined => {
    if (!dateProp) return undefined;
    if (typeof dateProp === 'string') {
      const parsed = new Date(dateProp);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    return dateProp;
  };

  const dateValue = getDateValue(date);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(dateValue);
  const [timeValue, setTimeValue] = useState<string>(
    dateValue ? format(dateValue, 'HH:mm') : ''
  );

  useEffect(() => {
    const newDateValue = getDateValue(date);
    setSelectedDate(newDateValue);
    setTimeValue(newDateValue ? format(newDateValue, 'HH:mm') : '');
  }, [date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const combinedDate = new Date(newDate);

      if (timeValue) {
        const [hours, minutes] = timeValue.split(':').map(Number);
        combinedDate.setHours(hours, minutes, 0, 0);
      } else {
        const now = new Date();
        combinedDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
      }

      setSelectedDate(combinedDate);
      onSelect(combinedDate);
    } else {
      setSelectedDate(undefined);
      onSelect(undefined);
    }
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);

    if (selectedDate && time) {
      const [hours, minutes] = time.split(':').map(Number);
      const combinedDate = new Date(selectedDate);

      combinedDate.setHours(hours, minutes, 0, 0);

      setSelectedDate(combinedDate);
      onSelect(combinedDate);
    }
  };

  return (
    <div className={cn('flex gap-2 w-full', className)}>
      
      {/* DATE PICKER */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'flex-1 justify-start text-left font-normal min-w-0',
              !selectedDate && 'text-muted-foreground',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">
              {selectedDate ? format(selectedDate, 'PPP') : placeholder}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>

      {/* TIME INPUT */}
      <div className="relative w-full sm:w-36 shrink-0">
      <Input
        type="time"
        value={timeValue}
        onChange={e => handleTimeChange(e.target.value)}
        disabled={disabled || !selectedDate}
        className="pl-9 h-10"
      />
      </div>
    </div>
  );
}