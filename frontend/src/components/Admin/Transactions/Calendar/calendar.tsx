"use client";

import { useRef, useEffect, useState } from "react";
import { DayPicker, DateRange as DayPickerRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { DateRange } from "../transaction-utils";

type CalendarProps = {
  initialRange: DateRange;
  onConfirm: (range: DateRange) => void;
  onCancel: () => void;
};

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export default function Calendar({ initialRange, onConfirm, onCancel }: CalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState<DayPickerRange | undefined>({
    from: initialRange.start,
    to: initialRange.end,
  });
  const [leftMonth, setLeftMonth] = useState<Date>(initialRange.start);
  const [rightMonth, setRightMonth] = useState<Date>(
    addMonths(initialRange.start, 1)
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCancel();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  function handleSelect(selected: DayPickerRange | undefined) {
    setDraft(selected);
  }

  function handleConfirm() {
    if (!draft?.from || !draft?.to) return;
    const start = draft.from < draft.to ? draft.from : draft.to;
    const end   = draft.from < draft.to ? draft.to   : draft.from;
    onConfirm({ start, end });
  }

  const confirmDisabled = !draft?.from || !draft?.to;

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-12 z-30 rounded-xl border border-gray-200 bg-white shadow-xl"
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
          color: #3d4f0a !important;
        }
        .rdp-nav button {
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          padding: 4px !important;
          color: #111 !important;
        }
      `}</style>

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
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={confirmDisabled}
          className="rounded-md bg-[#3d4f0a] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#4a5f0c] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
