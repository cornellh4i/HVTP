"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  isEditing?: boolean;
  disabled?: boolean;
}

export default function SelectField({
  value,
  onChange,
  options,
  placeholder = "Select...",
  isEditing = true,
  disabled = false,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? "";

  if (!isEditing) {
    return (
      <div className="w-full rounded border p-2 text-sm min-h-[2.25rem] text-gray-800 bg-gray-50">
        {displayLabel || <span className="text-gray-400">{placeholder}</span>}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded border p-2 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <span className={displayLabel ? "text-gray-900" : "text-gray-400"}>
          {displayLabel || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-full rounded border bg-white shadow-lg">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                opt.value === value ? "bg-blue-50 text-blue-700" : ""
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}