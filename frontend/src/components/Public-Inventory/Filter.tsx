"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Plus, ChevronDown, ChevronUp, X } from "lucide-react";

import {
  InventoryFilterOptions,
  InventoryFilters,
  InventorySort,
  PublicationState,
  defaultInventoryFilters,
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
  { key: "status", label: "Wool Type" },
  { key: "publicationState", label: "Publication State" },
  { key: "state", label: "State" },
];

const sortOptions: Array<{ value: InventorySort; label: string }> = [
  { value: "date-desc", label: "Date Added" },
  { value: "date-asc", label: "Date Added: Oldest" },
];

function getInitialExpandedState() {
  return filterSections.reduce<Record<FilterKey, boolean>>((accumulator, section, index) => {
    accumulator[section.key] = index < 2;
    return accumulator;
  }, {} as Record<FilterKey, boolean>);
}

function cloneFilters(filters: InventoryFilters): InventoryFilters {
  return {
    sortBy: filters.sortBy,
    grade: [...filters.grade],
    color: [...filters.color],
    breed: [...filters.breed],
    status: [...filters.status],
    publicationState: [...filters.publicationState],
    state: [...filters.state],
  };
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatFilterValue(key: FilterKey, value: string) {
  if (key === "publicationState") {
    return titleCase(value);
  }

  return value;
}

function getAppliedFilterChips(filters: InventoryFilters) {
  return filterSections.flatMap((section) =>
    (filters[section.key] as string[]).map((value) => ({
      key: section.key,
      value,
      label: `${section.label}: ${formatFilterValue(section.key, value)}`,
    }))
  );
}

export default function Filter({ filters, options, onChange }: FilterProps) {
  const [open, setOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<InventoryFilters>(() => cloneFilters(filters));
  const [expandedSections, setExpandedSections] = useState<Record<FilterKey, boolean>>(
    getInitialExpandedState
  );

  useEffect(() => {
    if (!open) {
      setDraftFilters(cloneFilters(filters));
    }
  }, [filters, open]);

  const activeFilterCount = filterSections.reduce(
    (count, section) => count + filters[section.key].length,
    0
  );
  const appliedFilterChips = getAppliedFilterChips(filters);

  const toggleSection = (key: FilterKey) => {
    setExpandedSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const toggleArrayFilter = (key: FilterKey, value: string) => {
    setDraftFilters((current) => {
      const currentValues = [...current[key]] as string[];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((entry) => entry !== value)
        : [...currentValues, value];

      return {
        ...current,
        [key]:
          key === "publicationState"
            ? (nextValues as PublicationState[])
            : nextValues,
      };
    });
  };

  const updateSort = (sortBy: InventorySort) => {
    const nextFilters = {
      ...filters,
      sortBy,
    };

    onChange(nextFilters);
    setDraftFilters(cloneFilters(nextFilters));
  };

  const clearDraftFilters = () => {
    setDraftFilters((current) => ({
      ...current,
      grade: [],
      color: [],
      breed: [],
      status: [],
      publicationState: [],
      state: [],
    }));
  };

  const applyFilters = () => {
    onChange(draftFilters);
    setOpen(false);
  };

  const clearAppliedFilters = () => {
    const resetFilters = {
      ...defaultInventoryFilters,
      sortBy: filters.sortBy,
    };

    onChange(resetFilters);
    setDraftFilters(cloneFilters(resetFilters));
  };

  const removeAppliedFilter = (key: FilterKey, value: string) => {
    const nextFilters = {
      ...filters,
      [key]:
        key === "publicationState"
          ? (filters[key].filter((entry) => entry !== value) as PublicationState[])
          : (filters[key].filter((entry) => entry !== value) as string[]),
    };

    onChange(nextFilters);
    setDraftFilters(cloneFilters(nextFilters));
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <select
          value={filters.sortBy}
          onChange={(event) => updateSort(event.target.value as InventorySort)}
          className="h-11 appearance-none rounded-2xl border border-[#556b2f] bg-[#556b2f] px-4 pr-10 text-sm font-medium text-white outline-none transition-colors hover:bg-[#465923]"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white"
          size={16}
        />
      </div>

      {appliedFilterChips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          type="button"
          onClick={() => removeAppliedFilter(chip.key, chip.value)}
          className="inline-flex h-11 items-center gap-3 rounded-2xl bg-[#f3ebd9] px-4 text-sm font-medium text-[#2f2a20] transition-colors hover:bg-[#ece1c8]"
        >
          <span>{chip.label}</span>
          <X size={18} className="text-[#556b2f]" />
        </button>
      ))}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-2xl px-1 text-sm font-medium text-[#2f391a] transition-colors hover:text-[#556b2f]"
          >
            <span className="text-xl leading-none text-[#556b2f]">+</span>
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-[#556b2f] px-2 py-0.5 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-white/75 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-[530px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[24px] border border-[#ebe6da] bg-white shadow-[0_20px_60px_rgba(53,51,42,0.18)] outline-none">
            <div className="flex items-center justify-between border-b border-[#e8e3d8] px-7 py-6">
              <Dialog.Title className="text-[18px] font-medium text-[#171717]">
                Filters
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-full p-1 text-[#171717] transition-colors hover:bg-[#f5f2ea]"
                  aria-label="Close filters"
                >
                  <X size={26} />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-3">
              <div className="space-y-2">
                {filterSections.map((section) => {
                  const isExpanded = expandedSections[section.key];
                  const sectionValues = options[section.key] as string[];
                  const selectedValues = draftFilters[section.key] as string[];

                  return (
                    <section key={section.key} className="border-b border-[#ece7dc] py-3 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.key)}
                        className="flex w-full items-center justify-between gap-4 py-2 text-left text-[15px] font-medium text-[#171717]"
                      >
                        <span>{section.label}</span>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {isExpanded && (
                        <div className="space-y-3 px-2 pb-2 pt-3">
                          {sectionValues.length > 0 ? (
                            sectionValues.map((value) => {
                              const checked = selectedValues.includes(value);

                              return (
                                <label
                                  key={value}
                                  className="flex cursor-pointer items-center gap-3 text-[15px] text-[#2a2a2a]"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleArrayFilter(section.key, value)}
                                    className="h-5 w-5 rounded-[5px] border border-[#a9a396] text-black accent-black"
                                  />
                                  <span>{formatFilterValue(section.key, value)}</span>
                                </label>
                              );
                            })
                          ) : (
                            <p className="text-sm text-[#8d887e]">No options available.</p>
                          )}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#e8e3d8] px-7 py-5">
              <button
                type="button"
                onClick={clearDraftFilters}
                className="rounded-2xl border border-[#70823a] px-4 py-2 text-sm font-medium text-[#556b2f] transition-colors hover:bg-[#f5f8ed]"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="rounded-2xl bg-[#556b2f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#465923]"
              >
                Apply Filters
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearAppliedFilters}
          className="text-sm font-medium text-[#7b776c] transition-colors hover:text-[#2a2a2a]"
        >
          Reset
        </button>
      )}
    </div>
  );
}
