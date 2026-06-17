import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useState } from 'react';
import { cn } from '../../utils';

interface DateRangePickerProps {
  value: { start: Date; end: Date };
  onChange: (range: { start: Date; end: Date }) => void;
  className?: string;
}

const presetRanges = [
  { label: '最近7天', days: 7 },
  { label: '最近15天', days: 15 },
  { label: '最近30天', days: 30 },
  { label: '本月', days: 'month' as const },
];

export function DateRangePicker({
  value,
  onChange,
  className = '',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (days: number | 'month') => {
    const end = new Date();
    let start: Date;

    if (days === 'month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else {
      start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    }

    onChange({ start, end });
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm"
      >
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700">
          {format(value.start, 'yyyy-MM-dd', { locale: zhCN })} ~{' '}
          {format(value.end, 'yyyy-MM-dd', { locale: zhCN })}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400 transition-transform" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2">
            {presetRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => handlePresetClick(range.days)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-md transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
