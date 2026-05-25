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

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export default function Calendar({ onRangeChange, onClose, initialRange, maxBars = 12 }: CalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const initialLeft = initialRange?.from ?? new Date();
  const [draft, setDraft] = useState<DateRange | undefined>(
    initialRange ? { from: initialRange.from, to: initialRange.to } : undefined
  );
  const [leftMonth, setLeftMonth] = useState<Date>(initialLeft);
  const [rightMonth, setRightMonth] = useState<Date>(addMonths(initialLeft, 1));

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
    setDraft(selected);
  }

  function handleQuickAction(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));

    if (getWeekBucketCount(start, end) > maxBars) return;

    setDraft({ from: start, to: end });
    setLeftMonth(start);
    setRightMonth(end);
  }

  function handleConfirm() {
    if (!draft?.from || !draft?.to) return;
    const start = draft.from < draft.to ? draft.from : draft.to;
    const end   = draft.from < draft.to ? draft.to   : draft.from;
    onRangeChange(start, end, false);
    onClose();
  }

  const confirmDisabled = !draft?.from || !draft?.to;

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

      {/* Two independent calendars */}
      <div className="flex flex-row gap-8 px-5 py-4">
        <DayPicker
          mode="range"
          numberOfMonths={1}
          selected={draft}
          onSelect={handleSelect}
          month={leftMonth}
          onMonthChange={setLeftMonth}
          endMonth={addMonths(rightMonth, -1)}
          showOutsideDays={false}
        />
        <DayPicker
          mode="range"
          numberOfMonths={1}
          selected={draft}
          onSelect={handleSelect}
          month={rightMonth}
          onMonthChange={setRightMonth}
          startMonth={addMonths(leftMonth, 1)}
          showOutsideDays={false}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
        <button
          onClick={onClose}
          className="rounded-md border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={confirmDisabled}
          className="rounded-md bg-[#1a1a1a] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
