"use client";
import { useState, useRef, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface CalendarProps {
  onRangeChange: (startDate: Date, endDate: Date) => void;
  onClose: () => void;
  initialRange?: { from: Date; to: Date };
}

export default function Calendar({ onRangeChange, onClose, initialRange }: CalendarProps) {
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
    setRange(selected);
    if (selected?.from && selected?.to) {
      const start = selected.from < selected.to ? selected.from : selected.to;
      const end = selected.from < selected.to ? selected.to : selected.from;
      onRangeChange(start, end);
    }
  }

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-gray-200 bg-white shadow-xl"
      style={{ minWidth: "620px" }}
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
          border-radius: 50% !important;
        }
        .rdp-selected .rdp-day_button {
          background-color: #1a1a1a !important;
          color: white !important;
          border-radius: 50% !important;
          border: none !important;
        }
        .rdp-range_middle .rdp-day_button {
          background-color: #f3f4f6 !important;
          color: #1a1a1a !important;
          border-radius: 0 !important;
        }
        .rdp-range_start .rdp-day_button,
        .rdp-range_end .rdp-day_button {
          background-color: #1a1a1a !important;
          color: white !important;
          border-radius: 50% !important;
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