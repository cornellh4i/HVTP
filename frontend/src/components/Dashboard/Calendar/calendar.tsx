"use client";
import { useState, useRef, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface CalendarProps {
  onRangeChange: (startDate: Date, endDate: Date, isQuickAction?: boolean) => void;
  onClose: () => void;
  initialRange?: { from: Date; to: Date };
  maxBars?: number;
}

const quickActions = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

function getWeekBucketCount(from: Date, to: Date): number {
  const start = from < to ? from : to;
  const end = from < to ? to : from;
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - cursor.getDay());

  let count = 0;

  while (cursor <= end) {
    count += 1;
    cursor.setDate(cursor.getDate() + 7);
  }

  return count;
}

export default function Calendar({ onRangeChange, onClose, initialRange, maxBars = 12 }: CalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<DateRange | undefined>(
    initialRange ? { from: initialRange.from, to: initialRange.to } : undefined
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  function handleSelect(selected: DateRange | undefined) {
    if (selected?.from && selected?.to) {
      const start = selected.from < selected.to ? selected.from : selected.to;
      const end = selected.from < selected.to ? selected.to : selected.from;

      if (getWeekBucketCount(start, end) > maxBars) {
        return;
      }

      setRange({ from: start, to: end });
      // isQuickAction = false → triggers "Custom" label in parent
      onRangeChange(start, end, false);
      return;
    }

    setRange(selected);
  }

  function handleQuickAction(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));

    if (getWeekBucketCount(start, end) > maxBars) {
      return;
    }

    setRange({ from: start, to: end });
    // isQuickAction = true → does NOT trigger "Custom" label in parent
    onRangeChange(start, end, true);
  }

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-gray-200 bg-white shadow-xl"
      style={{ minWidth: "680px" }}
    >
      <style>{`
        .rdp-root {
          --rdp-accent-color: #1a1a1a !important;
          --rdp-accent-background-color: #f3f4f6 !important;
        }
        .rdp-months {
          display: flex !important;
          flex-direction: row !important;
          gap: 2rem !important;
          padding: 1.25rem !important;
        }
        .rdp-month {
          flex: 1 !important;
        }
        .rdp-month_caption {
          font-weight: 700 !important;
          font-size: 1rem !important;
          color: #111 !important;
          margin-bottom: 0.75rem !important;
        }
        .rdp-weekday {
          color: #6b7280 !important;
          font-weight: 500 !important;
          font-size: 0.8rem !important;
          width: 2.5rem !important;
          text-align: center !important;
        }
        .rdp-day {
          width: 2.25rem !important;
          height: 2.25rem !important;
          font-size: 0.875rem !important;
          border-radius: 0 !important;
        }
        .rdp-selected .rdp-day_button {
          background-color: #1a1a1a !important;
          color: white !important;
          border-radius: 9999px !important;
          border: none !important;
        }
        .rdp-range_middle .rdp-day_button {
          background-color: #f3f4f6 !important;
          color: #1a1a1a !important;
          border-radius: 9999px !important;
        }
        .rdp-range_start .rdp-day_button,
        .rdp-range_end .rdp-day_button {
          background-color: #1a1a1a !important;
          color: white !important;
          border-radius: 9999px !important;
        }
        .rdp-today .rdp-day_button {
          font-weight: 700 !important;
          color: #3A4F00 !important;
        }
        .rdp-nav button {
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          padding: 4px !important;
          color: #111 !important;
        }
      `}</style>

      {/* Quick action buttons */}
      <div className="flex gap-2 border-b border-gray-100 px-5 pt-4 pb-3">
        {quickActions.map(({ label, days }) => (
          <button
            key={label}
            disabled={(() => {
              const end = new Date();
              const start = new Date();
              start.setDate(end.getDate() - (days - 1));
              return getWeekBucketCount(start, end) > maxBars;
            })()}
            onClick={() => handleQuickAction(days)}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
          >
            {label}
          </button>
        ))}
      </div>

      <DayPicker
        mode="range"
        numberOfMonths={2}
        selected={range}
        onSelect={handleSelect}
        defaultMonth={initialRange?.from ?? new Date()}
        showOutsideDays={false}
      />
    </div>
  );
}