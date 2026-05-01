"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Columns3,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { getAllSales, Sale } from "@/api/sales";
import Calendar from "./Calendar/calendar";
import SalesTable from "./Table/table";
import {
  ColumnKey,
  DateRange,
  FilterKey,
  columnLabels,
  defaultColumns,
  filterLabels,
  formatCurrency,
  formatQuantity,
  formatRange,
  getSaleDate,
  getSaleValue,
  isWithinRange,
} from "./transaction-utils";

type Filters = Record<FilterKey, string[]>;

const filterKeys: FilterKey[] = [
  "status",
  "woolType",
  "breed",
  "grade",
  "color",
  "publicationStatus",
  "state",
  "farmerName",
];

const allColumns = Object.keys(columnLabels) as ColumnKey[];

const initialRange = (): DateRange => {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);
  start.setDate(end.getDate() - 27);
  return { start, end };
};

const rangeFromSales = (sales: Sale[]): DateRange | null => {
  const dates = sales
    .map(getSaleDate)
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) return null;

  const end = new Date(dates[dates.length - 1]);
  const start = new Date(end);
  start.setDate(end.getDate() - 27);

  return { start, end };
};

const emptyFilters = (): Filters =>
  filterKeys.reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {} as Filters);

const copyFilters = (filters: Filters): Filters =>
  filterKeys.reduce((acc, key) => {
    acc[key] = [...filters[key]];
    return acc;
  }, {} as Filters);

const countFilters = (filters: Filters) =>
  filterKeys.reduce((count, key) => count + filters[key].length, 0);

function Summary({ sales }: { sales: Sale[] }) {
  const totals = useMemo(() => {
    return sales.reduce(
      (acc, sale) => {
        const revenue = sale.totalPrice ?? sale.pricePerWeight * sale.weightSold;
        const cost = sale.costPerWeight * sale.weightSold;

        acc.revenue += revenue;
        acc.cost += cost;
        acc.sold += sale.weightSold ?? 0;
        acc.purchased += sale.itemWeight ?? 0;
        return acc;
      },
      { revenue: 0, cost: 0, sold: 0, purchased: 0 }
    );
  }, [sales]);

  const stats = [
    { label: "TOTAL REVENUE", value: formatCurrency(totals.revenue) },
    { label: "TOTAL COST", value: formatCurrency(totals.cost) },
    { label: "TOTAL PROFIT", value: formatCurrency(totals.revenue - totals.cost) },
    { label: "QUANTITY PURCHASED", value: formatQuantity(totals.purchased) },
    { label: "QUANTITY SOLD", value: formatQuantity(totals.sold) },
  ];

  return (
    <div className="grid overflow-hidden rounded-md border border-[#aeadab] bg-white md:grid-cols-5">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`px-7 py-4 ${index > 0 ? "border-t border-[#aeadab] md:border-l md:border-t-0" : ""}`}
        >
          <div className="text-sm tracking-wide text-[#6a6a6a]">{stat.label}</div>
          <div className="mt-1 text-2xl font-bold text-black">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

function FilterPanel({
  options,
  draftFilters,
  onToggle,
  onApply,
  onClear,
  onClose,
}: {
  options: Record<FilterKey, string[]>;
  draftFilters: Filters;
  onToggle: (key: FilterKey, value: string) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [openKey, setOpenKey] = useState<FilterKey | null>(null);

  return (
    <div className="absolute left-0 top-[48px] z-20 w-[532px] rounded-lg bg-white p-7 shadow-lg ring-1 ring-black/5">
      <div className="flex items-center justify-between border-b border-[#dfdfdc] pb-4">
        <h2 className="text-2xl font-medium">Filters</h2>
        <button type="button" aria-label="Close filters" onClick={onClose}>
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="py-5">
        {filterKeys.map((key) => (
          <div key={key} className="border-b border-[#dfdfdc] py-3">
            <button
              type="button"
              onClick={() => setOpenKey(openKey === key ? null : key)}
              className="flex w-full items-center justify-between text-left text-lg"
            >
              <span>
                {filterLabels[key]}
                {draftFilters[key].length > 0 && (
                  <span className="ml-2 text-sm text-[#66721a]">
                    ({draftFilters[key].length})
                  </span>
                )}
              </span>
              <span className="text-xl">⌄</span>
            </button>
            {openKey === key && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {options[key].length === 0 ? (
                  <div className="col-span-2 text-sm text-gray-500">No options available</div>
                ) : (
                  options[key].map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-[#333]">
                      <input
                        type="checkbox"
                        checked={draftFilters[key].includes(option)}
                        onChange={() => onToggle(key, option)}
                        className="h-4 w-4 accent-[#3d4f0a]"
                      />
                      {option}
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-[#efefec] pt-5">
        <button
          type="button"
          onClick={onClear}
          className="rounded-md border border-[#3d4f0a] px-4 py-2 text-[#3d4f0a]"
        >
          Clear All
        </button>
        <button
          type="button"
          onClick={onApply}
          className="rounded-md bg-[#3d4f0a] px-4 py-2 text-white"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

function ColumnsPanel({
  draftColumns,
  onToggle,
  onApply,
  onCancel,
}: {
  draftColumns: ColumnKey[];
  onToggle: (column: ColumnKey) => void;
  onApply: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="absolute left-0 top-[48px] z-20 w-[360px] rounded-lg bg-white p-6 shadow-lg ring-1 ring-black/5">
      <div className="flex items-center justify-between border-b border-[#dfdfdc] pb-4">
        <h2 className="text-2xl font-medium">Show Columns</h2>
        <button type="button" aria-label="Close columns" onClick={onCancel}>
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 py-6">
        {allColumns.map((column) => (
          <label key={column} className="flex items-center gap-2 text-lg text-[#333]">
            <input
              type="checkbox"
              checked={draftColumns.includes(column)}
              onChange={() => onToggle(column)}
              className="h-5 w-5 accent-[#333]"
            />
            {columnLabels[column]}
          </label>
        ))}
      </div>
      <div className="flex items-center justify-between">
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

export default function Transactions() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(() => initialRange());
  const [draftRange, setDraftRange] = useState<DateRange>(() => initialRange());
  const [calendarMonth, setCalendarMonth] = useState(() => initialRange().start);
  const [openPanel, setOpenPanel] = useState<"calendar" | "filters" | "columns" | null>(null);
  const [filters, setFilters] = useState<Filters>(() => emptyFilters());
  const [draftFilters, setDraftFilters] = useState<Filters>(() => emptyFilters());
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(defaultColumns);
  const [draftColumns, setDraftColumns] = useState<ColumnKey[]>(defaultColumns);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllSales();
        setSales(data);
        const defaultRange = rangeFromSales(data);

        if (defaultRange) {
          setDateRange(defaultRange);
          setDraftRange(defaultRange);
          setCalendarMonth(defaultRange.start);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const filterOptions = useMemo(() => {
    return filterKeys.reduce((acc, key) => {
      acc[key] = Array.from(new Set(sales.map((sale) => getSaleValue(sale, key)).filter(Boolean))).sort();
      return acc;
    }, {} as Record<FilterKey, string[]>);
  }, [sales]);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (!isWithinRange(sale, dateRange)) return false;

      return filterKeys.every((key) => {
        if (filters[key].length === 0) return true;
        return filters[key].includes(getSaleValue(sale, key));
      });
    });
  }, [sales, dateRange, filters]);

  const activeFilterCount = countFilters(filters);

  const toggleFilter = (key: FilterKey, value: string) => {
    setDraftFilters((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  };

  const toggleColumn = (column: ColumnKey) => {
    setDraftColumns((current) => {
      if (current.includes(column)) {
        return current.length === 1 ? current : current.filter((item) => item !== column);
      }
      return [...current, column];
    });
  };

  return (
    <main className="min-h-screen bg-white px-6 py-8 md:px-10">
      <div className="mx-auto max-w-[1560px]">
        <h1 className="text-5xl font-bold tracking-normal text-black">Transactions</h1>

        <div className="mt-14 flex flex-col gap-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex w-full max-w-[392px] items-center gap-3 rounded-md border border-[#aeadab] px-4 py-3 text-[#949494]">
              <Search className="h-6 w-6" />
              <input
                aria-label="Search"
                placeholder="Search"
                disabled
                className="w-full bg-transparent text-lg outline-none placeholder:text-[#949494]"
              />
            </div>

            <button
              type="button"
              className="inline-flex w-fit items-center gap-3 rounded-md bg-[#3d4f0a] px-5 py-3 text-white"
            >
              <Download className="h-5 w-5" />
              Export
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-7">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDraftRange(dateRange);
                  setCalendarMonth(dateRange.start);
                  setOpenPanel(openPanel === "calendar" ? null : "calendar");
                }}
                className="inline-flex items-center gap-3 rounded-md bg-[#3d4f0a] px-4 py-3 text-white"
              >
                <CalendarDays className="h-5 w-5" />
                {formatRange(dateRange)}
              </button>
              {openPanel === "calendar" && (
                <Calendar
                  draftRange={draftRange}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  onRangeChange={setDraftRange}
                  onCancel={() => setOpenPanel(null)}
                  onApply={() => {
                    setDateRange(draftRange);
                    setOpenPanel(null);
                  }}
                />
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDraftFilters(copyFilters(filters));
                  setOpenPanel(openPanel === "filters" ? null : "filters");
                }}
                className={`inline-flex items-center gap-3 rounded-md px-4 py-3 ${
                  openPanel === "filters" || activeFilterCount > 0
                    ? "bg-[#a4a39e] text-white"
                    : "bg-white text-black"
                }`}
              >
                <Plus className="h-5 w-5 text-[#3d4f0a]" />
                Filters
                {activeFilterCount > 0 && <span>({activeFilterCount})</span>}
              </button>
              {openPanel === "filters" && (
                <FilterPanel
                  options={filterOptions}
                  draftFilters={draftFilters}
                  onToggle={toggleFilter}
                  onClose={() => setOpenPanel(null)}
                  onClear={() => {
                    const cleared = emptyFilters();
                    setDraftFilters(cleared);
                    setFilters(cleared);
                  }}
                  onApply={() => {
                    setFilters(copyFilters(draftFilters));
                    setOpenPanel(null);
                  }}
                />
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDraftColumns(visibleColumns);
                  setOpenPanel(openPanel === "columns" ? null : "columns");
                }}
                className={`inline-flex items-center gap-3 rounded-md px-4 py-3 ${
                  openPanel === "columns" ? "bg-[#a4a39e] text-white" : "bg-white text-black"
                }`}
              >
                {openPanel === "columns" ? (
                  <Columns3 className="h-5 w-5 text-white" />
                ) : (
                  <SlidersHorizontal className="h-5 w-5 text-[#3d4f0a]" />
                )}
                Show Columns
              </button>
              {openPanel === "columns" && (
                <ColumnsPanel
                  draftColumns={draftColumns}
                  onToggle={toggleColumn}
                  onCancel={() => setOpenPanel(null)}
                  onApply={() => {
                    setVisibleColumns(draftColumns);
                    setOpenPanel(null);
                  }}
                />
              )}
            </div>
          </div>

          <Summary sales={filteredSales} />

          <div className="pt-9">
            <div className="flex gap-10 border-b border-[#aeadab] text-2xl">
              <button type="button" className="pb-3 text-black">
                Purchases
              </button>
              <button type="button" className="border-b-[6px] border-[#848c2d] pb-3 text-black">
                Sales
              </button>
            </div>
            <div className="border-t border-[#aeadab] pt-7">
              {loading && <div className="rounded-md border p-8 text-center text-gray-500">Loading sales...</div>}
              {error && <div className="rounded-md border p-8 text-center text-red-600">Error: {error}</div>}
              {!loading && !error && <SalesTable sales={filteredSales} visibleColumns={visibleColumns} />}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
