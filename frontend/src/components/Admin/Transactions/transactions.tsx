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
import { getAllItems, Item } from "@/api/items";
import { getAllSales, Sale } from "@/api/sales";
import Calendar from "./Calendar/calendar";
import PurchaseTable from "./Table/purchase-table";
import SalesTable from "./Table/table";
import {
  ColumnKey,
  DateRange,
  FilterKey,
  PurchaseColumnKey,
  TabKey,
  columnLabels,
  defaultColumns,
  defaultPurchaseColumns,
  filterLabels,
  formatCurrency,
  formatQuantity,
  formatRange,
  getItemDate,
  getPurchaseValue,
  getSaleDate,
  getSaleValue,
  isItemWithinRange,
  isWithinRange,
  purchaseColumnLabels,
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

const purchaseFilterKeys: FilterKey[] = [
  "status",
  "woolType",
  "breed",
  "grade",
  "color",
  "publicationStatus",
];

const allColumns = Object.keys(columnLabels) as ColumnKey[];
const allPurchaseColumns = Object.keys(purchaseColumnLabels) as PurchaseColumnKey[];

const initialRange = (): DateRange => {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);
  start.setDate(end.getDate() - 27);
  return { start, end };
};

const rangeFromDates = (dates: Date[]): DateRange | null => {
  const sorted = dates.filter(Boolean).sort((a, b) => a.getTime() - b.getTime());

  if (sorted.length === 0) return null;

  const end = new Date(sorted[sorted.length - 1]);
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

const countFilters = (filters: Filters, keys: FilterKey[]) =>
  keys.reduce((count, key) => count + filters[key].length, 0);

function Summary({ sales, items, activeTab }: { sales: Sale[]; items: Item[]; activeTab: TabKey }) {
  const totals = useMemo(() => {
    if (activeTab === "purchases") {
      return items.reduce(
        (acc, item) => {
          const cost = (item.purchasePrice ?? 0) * (item.weight ?? 0);
          acc.cost += cost;
          acc.purchased += item.weight ?? 0;
          return acc;
        },
        { revenue: 0, cost: 0, sold: 0, purchased: 0 }
      );
    }

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
  }, [sales, items, activeTab]);

  const stats = [
    { label: "TOTAL PROFIT", value: formatCurrency(totals.revenue - totals.cost) },
    { label: "TOTAL COST", value: formatCurrency(totals.cost) },
    { label: "TOTAL REVENUE", value: formatCurrency(totals.revenue) },
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
  visibleFilterKeys,
  onToggle,
  onApply,
  onClear,
  onClose,
}: {
  options: Record<FilterKey, string[]>;
  draftFilters: Filters;
  visibleFilterKeys: FilterKey[];
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
        {visibleFilterKeys.map((key) => (
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
  activeTab,
  draftColumns,
  draftPurchaseColumns,
  onToggle,
  onTogglePurchase,
  onApply,
  onCancel,
}: {
  activeTab: TabKey;
  draftColumns: ColumnKey[];
  draftPurchaseColumns: PurchaseColumnKey[];
  onToggle: (column: ColumnKey) => void;
  onTogglePurchase: (column: PurchaseColumnKey) => void;
  onApply: () => void;
  onCancel: () => void;
}) {
  const columns = activeTab === "purchases" ? allPurchaseColumns : allColumns;
  const labels = activeTab === "purchases" ? purchaseColumnLabels : columnLabels;
  const selected = activeTab === "purchases" ? draftPurchaseColumns : draftColumns;

  return (
    <div className="absolute left-0 top-[48px] z-20 w-[360px] rounded-lg bg-white p-6 shadow-lg ring-1 ring-black/5">
      <div className="flex items-center justify-between border-b border-[#dfdfdc] pb-4">
        <h2 className="text-2xl font-medium">Show Columns</h2>
        <button type="button" aria-label="Close columns" onClick={onCancel}>
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 py-6">
        {columns.map((column) => (
          <label key={column} className="flex items-center gap-2 text-lg text-[#333]">
            <input
              type="checkbox"
              checked={selected.includes(column as ColumnKey & PurchaseColumnKey)}
              onChange={() => {
                if (activeTab === "purchases") {
                  onTogglePurchase(column as PurchaseColumnKey);
                } else {
                  onToggle(column as ColumnKey);
                }
              }}
              className="h-5 w-5 accent-[#333]"
            />
            {labels[column as keyof typeof labels]}
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
  const [activeTab, setActiveTab] = useState<TabKey>("purchases");
  const [sales, setSales] = useState<Sale[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(() => initialRange());
  const [openPanel, setOpenPanel] = useState<"calendar" | "filters" | "columns" | null>(null);
  const [filters, setFilters] = useState<Filters>(() => emptyFilters());
  const [draftFilters, setDraftFilters] = useState<Filters>(() => emptyFilters());
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(defaultColumns);
  const [draftColumns, setDraftColumns] = useState<ColumnKey[]>(defaultColumns);
  const [visiblePurchaseColumns, setVisiblePurchaseColumns] =
    useState<PurchaseColumnKey[]>(defaultPurchaseColumns);
  const [draftPurchaseColumns, setDraftPurchaseColumns] =
    useState<PurchaseColumnKey[]>(defaultPurchaseColumns);

  const activeFilterKeys = activeTab === "purchases" ? purchaseFilterKeys : filterKeys;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [salesData, itemsData] = await Promise.all([getAllSales(), getAllItems()]);
        setSales(salesData);
        setItems(itemsData);

        const saleDates = salesData
          .map(getSaleDate)
          .filter((date): date is Date => Boolean(date));
        const itemDates = itemsData
          .map(getItemDate)
          .filter((date): date is Date => Boolean(date));
        const defaultRange = rangeFromDates([...saleDates, ...itemDates]);

        if (defaultRange) {
          setDateRange(defaultRange);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterOptions = useMemo(() => {
    if (activeTab === "purchases") {
      return purchaseFilterKeys.reduce((acc, key) => {
        acc[key] = Array.from(
          new Set(items.map((item) => getPurchaseValue(item, key)).filter(Boolean))
        ).sort();
        return acc;
      }, {} as Record<FilterKey, string[]>);
    }

    return filterKeys.reduce((acc, key) => {
      acc[key] = Array.from(
        new Set(sales.map((sale) => getSaleValue(sale, key)).filter(Boolean))
      ).sort();
      return acc;
    }, {} as Record<FilterKey, string[]>);
  }, [sales, items, activeTab]);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (!isWithinRange(sale, dateRange)) return false;

      return filterKeys.every((key) => {
        if (filters[key].length === 0) return true;
        return filters[key].includes(getSaleValue(sale, key));
      });
    });
  }, [sales, dateRange, filters]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!isItemWithinRange(item, dateRange)) return false;

      return purchaseFilterKeys.every((key) => {
        if (filters[key].length === 0) return true;
        return filters[key].includes(getPurchaseValue(item, key));
      });
    });
  }, [items, dateRange, filters]);

  const activeFilterCount = countFilters(filters, activeFilterKeys);

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

  const togglePurchaseColumn = (column: PurchaseColumnKey) => {
    setDraftPurchaseColumns((current) => {
      if (current.includes(column)) {
        return current.length === 1 ? current : current.filter((item) => item !== column);
      }
      return [...current, column];
    });
  };

  const tabButtonClass = (tab: TabKey) =>
    `pb-3 text-black ${activeTab === tab ? "border-b-[6px] border-[#848c2d]" : ""}`;

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
              Download CSV
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-7">
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenPanel(openPanel === "calendar" ? null : "calendar")}
                className="inline-flex items-center gap-3 rounded-md bg-[#3d4f0a] px-4 py-3 text-white"
              >
                <CalendarDays className="h-5 w-5" />
                {formatRange(dateRange)}
              </button>
              {openPanel === "calendar" && (
                <Calendar
                  initialRange={dateRange}
                  onConfirm={(range) => {
                    setDateRange(range);
                    setOpenPanel(null);
                  }}
                  onCancel={() => setOpenPanel(null)}
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
                  visibleFilterKeys={activeFilterKeys}
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
                  setDraftPurchaseColumns(visiblePurchaseColumns);
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
                  activeTab={activeTab}
                  draftColumns={draftColumns}
                  draftPurchaseColumns={draftPurchaseColumns}
                  onToggle={toggleColumn}
                  onTogglePurchase={togglePurchaseColumn}
                  onCancel={() => setOpenPanel(null)}
                  onApply={() => {
                    setVisibleColumns(draftColumns);
                    setVisiblePurchaseColumns(draftPurchaseColumns);
                    setOpenPanel(null);
                  }}
                />
              )}
            </div>
          </div>

          <Summary
            sales={filteredSales}
            items={filteredItems}
            activeTab={activeTab}
          />

          <div className="pt-9">
            <div className="flex gap-10 border-b border-[#aeadab] text-2xl">
              <button
                type="button"
                className={tabButtonClass("purchases")}
                onClick={() => setActiveTab("purchases")}
              >
                Purchase History
              </button>
              <button
                type="button"
                className={tabButtonClass("sales")}
                onClick={() => setActiveTab("sales")}
              >
                Sales History
              </button>
            </div>
            <div className="border-t border-[#aeadab] pt-7">
              {loading && (
                <div className="rounded-md border p-8 text-center text-gray-500">
                  Loading {activeTab === "purchases" ? "purchases" : "sales"}...
                </div>
              )}
              {error && (
                <div className="rounded-md border p-8 text-center text-red-600">Error: {error}</div>
              )}
              {!loading && !error && activeTab === "purchases" && (
                <PurchaseTable items={filteredItems} visibleColumns={visiblePurchaseColumns} />
              )}
              {!loading && !error && activeTab === "sales" && (
                <SalesTable sales={filteredSales} visibleColumns={visibleColumns} />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
