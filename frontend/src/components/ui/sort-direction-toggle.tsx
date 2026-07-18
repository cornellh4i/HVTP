"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

import { SortDirection } from "@/lib/sorting";
import { cn } from "@/lib/utils";

export type SortDirectionToggleMode = "arrows" | "alpha";

type SortDirectionToggleProps = {
  mode: SortDirectionToggleMode;
  value: SortDirection;
  onChange: (direction: SortDirection) => void;
  className?: string;
};

type Segment = {
  direction: SortDirection;
  label: string;
  icon?: typeof ArrowDown;
};

function getSegments(mode: SortDirectionToggleMode): [Segment, Segment] {
  if (mode === "alpha") {
    return [
      { direction: "asc", label: "A-Z" },
      { direction: "desc", label: "Z-A" },
    ];
  }

  return [
    { direction: "desc", label: "Descending", icon: ArrowDown },
    { direction: "asc", label: "Ascending", icon: ArrowUp },
  ];
}

export function SortDirectionToggle({
  mode,
  value,
  onChange,
  className,
}: SortDirectionToggleProps) {
  const segments = getSegments(mode);

  return (
    <div
      role="group"
      aria-label="Sort direction"
      className={cn(
        "inline-flex h-9 overflow-hidden rounded-lg border border-[#d4d0c8] bg-white",
        className
      )}
    >
      {segments.map((segment) => {
        const isActive = value === segment.direction;
        const Icon = segment.icon;

        return (
          <button
            key={segment.direction}
            type="button"
            aria-pressed={isActive}
            aria-label={segment.label}
            onClick={() => onChange(segment.direction)}
            className={cn(
              "inline-flex h-full min-w-11 items-center justify-center px-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#9a9a9a] text-white"
                : "bg-white text-[#6b6b6b] hover:bg-[#f5f5f5]"
            )}
          >
            {Icon ? <Icon size={16} strokeWidth={2.25} /> : segment.label}
          </button>
        );
      })}
    </div>
  );
}
