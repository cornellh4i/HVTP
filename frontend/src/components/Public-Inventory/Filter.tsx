"use client";

import { SlidersHorizontal, ChevronDown, Check, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  InventoryFilterOptions,
  InventoryFilters,
  InventorySort,
  PublicationState,
} from "@/components/Admin/Inventory/inventory-utils";

type FilterProps = {
  filters: InventoryFilters;
  options: InventoryFilterOptions;
  onChange: (filters: InventoryFilters) => void;
};

type FilterKey = Exclude<keyof InventoryFilters, "sortBy">;

const filterSections: Array<{ key: FilterKey; label: string }> = [
  { key: "grade", label: "Grade" },
  { key: "color", label: "Color" },
  { key: "breed", label: "Breed" },
  { key: "status", label: "Status" },
  { key: "publicationState", label: "Publication State" },
  { key: "state", label: "State" },
];

const sortOptions: Array<{ value: InventorySort; label: string }> = [
  { value: "date-desc", label: "Date Added: Newest" },
  { value: "date-asc", label: "Date Added: Oldest" },
];

function FilterSection({
  label,
  values,
  selectedValues,
  onToggle,
}: {
  label: string;
  values: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="flex flex-wrap gap-2">
        {values.length > 0 ? (
          values.map((value) => {
            const selected = selectedValues.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => onToggle(value)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
                  selected
                    ? "border-[#556b2f] bg-[#556b2f] text-white"
                    : "border-[#556b2f] bg-white text-[#556b2f] hover:bg-[#f3f7eb]"
                }`}
              >
                {selected && <Check size={14} />}
                {value}
              </button>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">No options available.</p>
        )}
      </div>
    </div>
  );
}

export default function Filter({ filters, options, onChange }: FilterProps) {
  const activeFilterCount = filterSections.reduce(
    (count, section) => count + filters[section.key].length,
    0
  );

  const toggleArrayFilter = (key: FilterKey, value: string) => {
    const currentValues = [...filters[key]] as string[];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((entry) => entry !== value)
      : [...currentValues, value];

    onChange({
      ...filters,
      [key]:
        key === "publicationState"
          ? (nextValues as PublicationState[])
          : nextValues,
    });
  };

  const updateSort = (sortBy: InventorySort) => {
    onChange({
      ...filters,
      sortBy,
    });
  };

  const clearFilters = () => {
    onChange({
      ...filters,
      grade: [],
      color: [],
      breed: [],
      status: [],
      publicationState: [],
      state: [],
    });
  };

  return (
    <>
      <div className="hidden flex-wrap items-center gap-3 lg:flex">
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(event) => updateSort(event.target.value as InventorySort)}
            className="h-11 appearance-none rounded-xl border border-[#556b2f] bg-[#556b2f] px-4 pr-10 text-sm font-medium text-white outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white" size={16} />
        </div>

        {filterSections.map((section) => (
          <details key={section.key} className="group relative">
            <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-[#556b2f] bg-white px-4 text-sm font-medium text-[#374151]">
              <span className="text-lg leading-none text-[#556b2f]">+</span>
              {section.label}
              {filters[section.key].length > 0 && (
                <span className="rounded-full bg-[#556b2f] px-2 py-0.5 text-xs text-white">
                  {filters[section.key].length}
                </span>
              )}
            </summary>
            <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
              <FilterSection
                label={section.label}
                values={options[section.key] as string[]}
                selectedValues={filters[section.key] as string[]}
                onToggle={(value) => toggleArrayFilter(section.key, value)}
              />
            </div>
          </details>
        ))}

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="h-11 rounded-xl border-[#556b2f] px-4 text-base font-medium text-[#556b2f] hover:bg-[#f3f7eb]"
            >
              <SlidersHorizontal size={18} />
              Filter
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-[#556b2f] px-2 py-0.5 text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Filter Inventory</SheetTitle>
              <SheetDescription>Choose filters to narrow the admin inventory list.</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {filterSections.map((section) => (
                <FilterSection
                  key={section.key}
                  label={section.label}
                  values={options[section.key] as string[]}
                  selectedValues={filters[section.key] as string[]}
                  onToggle={(value) => toggleArrayFilter(section.key, value)}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="w-full rounded-xl border-slate-300"
              >
                Clear Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(event) => updateSort(event.target.value as InventorySort)}
            className="h-11 appearance-none rounded-xl border border-[#556b2f] bg-white px-4 pr-10 text-base font-medium text-[#556b2f] outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ArrowUpDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#556b2f]" size={16} />
        </div>
      </div>
    </>
  );
}
