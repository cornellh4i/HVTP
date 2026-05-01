"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange, formatRange } from "../transaction-utils";

type CalendarProps = {
  draftRange: DateRange;
  month: Date;
  onMonthChange: (date: Date) => void;
  onRangeChange: (range: DateRange) => void;
  onApply: () => void;
  onCancel: () => void;
};

const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

function MonthGrid({
  month,
  range,
  onPick,
}: {
  month: Date;
  range: DateRange;
  onPick: (date: Date) => void;
}) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const blanks = Array.from({ length: first.getDay() });
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const title = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="w-[320px]">
      <h3 className="mb-6 text-center text-xl font-semibold">{title}</h3>
      <div className="mb-4 grid grid-cols-7 text-center text-base font-semibold text-[#686868]">
        {dayLabels.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-3 text-center text-lg font-medium">
        {blanks.map((_, index) => (
          <div key={`blank-${index}`} className="h-10" />
        ))}
        {days.map((day) => {
          const date = new Date(month.getFullYear(), month.getMonth(), day);
          const selected = sameDay(date, range.start) || sameDay(date, range.end);
          const inRange = startOfDay(date) >= startOfDay(range.start) && startOfDay(date) <= startOfDay(range.end);

          return (
            <button
              key={day}
              type="button"
              onClick={() => onPick(date)}
              className={`mx-auto h-10 w-full rounded-md transition-colors ${
                selected
                  ? "bg-[#4b2306] text-white"
                  : inRange
                    ? "bg-[#eee9dd] text-black"
                    : "text-black hover:bg-[#f5f2eb]"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Calendar({
  draftRange,
  month,
  onMonthChange,
  onRangeChange,
  onApply,
  onCancel,
}: CalendarProps) {
  const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);

  const pickDate = (date: Date) => {
    const start = startOfDay(draftRange.start);
    const end = startOfDay(draftRange.end);
    const picked = startOfDay(date);

    if (picked < start || start !== end) {
      onRangeChange({ start: date, end: date });
      return;
    }

    onRangeChange({ start: draftRange.start, end: date });
  };

  return (
    <div className="absolute left-0 top-[48px] z-30 w-[760px] rounded-md border border-[#d1d1cc] bg-white p-7 shadow-md">
      <span className="sr-only">{formatRange(draftRange)}</span>
      <button
        type="button"
        aria-label="Previous month"
        onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        className="absolute left-7 top-7 flex h-9 w-9 items-center justify-center rounded-md border border-[#d1d1cc] text-[#8a8a86]"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next month"
        onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        className="absolute right-7 top-7 flex h-9 w-9 items-center justify-center rounded-md border border-[#d1d1cc] text-[#8a8a86]"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="flex gap-14">
        <MonthGrid month={month} range={draftRange} onPick={pickDate} />
        <MonthGrid month={nextMonth} range={draftRange} onPick={pickDate} />
      </div>
      <div className="mt-12 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-[#3d4f0a] px-4 py-2 text-[#333]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onApply}
          className="rounded-md bg-[#3d4f0a] px-4 py-2 text-white"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
