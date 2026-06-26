"use client";

import { useRef, useEffect, useState } from "react";
import { DayPicker, DateRange as DayPickerRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { DateRange } from "../transaction-utils";
import styles from "./calendar.module.css";

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
    <div ref={containerRef} className={styles.calendar}>
      {/* Two independent calendars */}
      <div className={styles.months}>
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
      <div className={styles.footer}>
        <button type="button" onClick={onCancel} className={styles.btnCancel}>
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={confirmDisabled}
          className={styles.btnConfirm}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
