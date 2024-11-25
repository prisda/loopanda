import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';

interface DateRange {
  start: Date;
  end: Date;
}

interface DatePeriodPickerProps {
  onChange: (range: DateRange) => void;
  value: DateRange;
}

export function DatePeriodPicker({ onChange, value }: DatePeriodPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const handleDateClick = (date: Date) => {
    if (!selectedStartDate) {
      setSelectedStartDate(date);
    } else {
      const start = date < selectedStartDate ? date : selectedStartDate;
      const end = date > selectedStartDate ? date : selectedStartDate;
      onChange({ start, end });
      setSelectedStartDate(null);
    }
  };

  const isInRange = (date: Date) => {
    if (selectedStartDate) {
      return isSameDay(date, selectedStartDate) || 
        (date >= selectedStartDate && date <= value.end) ||
        (date <= selectedStartDate && date >= value.start);
    }
    return date >= value.start && date <= value.end;
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
        <CalendarIcon className="w-4 h-4 mr-2" />
        {format(value.start, 'MMM d')} - {format(value.end, 'MMM d')}
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg p-4 z-10 border border-gray-200">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map(day => (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`
                  p-2 text-sm rounded-lg relative
                  ${!isSameMonth(day, currentMonth) ? 'text-gray-400' : ''}
                  ${isToday(day) ? 'font-bold' : ''}
                  ${isInRange(day) ? 'bg-brand-light text-brand' : 'hover:bg-gray-100'}
                  ${isSameDay(day, selectedStartDate) ? 'bg-brand text-white' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChange({
                start: startOfMonth(new Date()),
                end: endOfMonth(new Date())
              })}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              This Month
            </button>
            <button
              onClick={() => onChange({
                start: startOfMonth(subMonths(new Date(), 1)),
                end: endOfMonth(new Date())
              })}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Last Month
            </button>
          </div>
        </div>
      </Menu.Items>
    </Menu>
  );
}