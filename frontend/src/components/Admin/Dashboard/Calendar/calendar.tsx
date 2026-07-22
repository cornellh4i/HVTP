"use client";
import { useState, useRef, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import styles from "./calendar.module.css";

interface CalendarProps {
  onRangeChange: (startDate: Date, endDate: Date) => void;
  onClose: () => void;
  initialRange?: { from: Date; to: Date };
}

const quickActions = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 6 Months", months: 6 },
  { label: "Last 12 Months", months: 12 },
];

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function rangeFromQuickAction(action: { days?: number; months?: number }): { from: Date; to: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  if (action.days) {
    start.setDate(end.getDate() - (action.days - 1));
  } else if (action.months) {
    start.setMonth(end.getMonth() - action.months);
    start.setDate(start.getDate() + 1);
  }

  return { from: start, to: end };
}

export default function Calendar({ onRangeChange, onClose, initialRange }: CalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const initialLeft = initialRange?.from ?? new Date();
  const [draft, setDraft] = useState<DateRange | undefined>(
    initialRange ? { from: initialRange.from, to: initialRange.to } : undefined
  );
  const [leftMonth, setLeftMonth] = useState<Date>(initialLeft);
  const [rightMonth, setRightMonth] = useState<Date>(addMonths(initialLeft, 1));
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);

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
    setActiveQuickAction(null);
  }

  function handleQuickAction(label: string, action: { days?: number; months?: number }) {
    const { from, to } = rangeFromQuickAction(action);
    setDraft({ from, to });
    setLeftMonth(from);
    setRightMonth(to);
    setActiveQuickAction(label);
  }

  function handleSave() {
    if (!draft?.from || !draft?.to) return;
    const start = draft.from < draft.to ? draft.from : draft.to;
    const end = draft.from < draft.to ? draft.to : draft.from;
    onRangeChange(start, end);
    onClose();
  }

  const saveDisabled = !draft?.from || !draft?.to;

  return (
    <div ref={containerRef} className={styles.calendar}>
      <div className={styles.quickActions}>
        <p className={styles.quickActionsTitle}>Quick action time range</p>
        <div className={styles.quickActionsList}>
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => handleQuickAction(action.label, action)}
              className={`${styles.quickAction} ${
                activeQuickAction === action.label ? styles.quickActionActive : ""
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

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
          className={styles.dayPicker}
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
          className={styles.dayPicker}
        />
      </div>

      <div className={styles.footer}>
        <button type="button" onClick={onClose} className={styles.cancelButton}>
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saveDisabled}
          className={styles.saveButton}
        >
          Save
        </button>
      </div>
    </div>
  );
}
