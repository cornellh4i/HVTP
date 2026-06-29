"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import styles from "./transactions.module.css";

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
    <div className={styles.summary}>
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`${styles.summaryCell} ${index > 0 ? styles.summaryCellDivider : ""}`}
        >
          <div className={styles.summaryLabel}>{stat.label}</div>
          <div className={styles.summaryValue}>{stat.value}</div>
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
    <div className={styles.filterPanel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Filters</h2>
        <button type="button" aria-label="Close filters" onClick={onClose}>
          <X className={styles.closeIcon} />
        </button>
      </div>
      <div className={styles.filterBody}>
        {visibleFilterKeys.map((key) => (
          <div key={key} className={styles.filterRow}>
            <button
              type="button"
              onClick={() => setOpenKey(openKey === key ? null : key)}
              className={styles.filterToggle}
            >
              <span>
                {filterLabels[key]}
                {draftFilters[key].length > 0 && (
                  <span className={styles.filterCount}>
                    ({draftFilters[key].length})
                  </span>
                )}
              </span>
              <span className={styles.chevron}>⌄</span>
            </button>
            {openKey === key && (
              <div className={styles.optionsGrid}>
                {options[key].length === 0 ? (
                  <div className={styles.noOptions}>No options available</div>
                ) : (
                  options[key].map((option) => (
                    <label key={option} className={styles.optionLabel}>
                      <input
                        type="checkbox"
                        checked={draftFilters[key].includes(option)}
                        onChange={() => onToggle(key, option)}
                        className={styles.checkbox}
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
      <div className={styles.filterFooter}>
        <button type="button" onClick={onClear} className={styles.btnOutline}>
          Clear All
        </button>
        <button type="button" onClick={onApply} className={styles.btnPrimary}>
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
    <div className={styles.columnsPanel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Show Columns</h2>
        <button type="button" aria-label="Close columns" onClick={onCancel}>
          <X className={styles.closeIcon} />
        </button>
      </div>
      <div className={styles.columnsGrid}>
        {columns.map((column) => (
          <label key={column} className={styles.columnLabel}>
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
              className={styles.columnCheckbox}
            />
            {labels[column as keyof typeof labels]}
          </label>
        ))}
      </div>
      <div className={styles.columnsFooter}>
        <button type="button" onClick={onCancel} className={styles.btnOutlineDark}>
          Cancel
        </button>
        <button type="button" onClick={onApply} className={styles.btnPrimary}>
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

  const loadData = useCallback(async (resetRange = false) => {
    try {
      setLoading(true);
      setError(null);
      const [salesData, itemsData] = await Promise.all([getAllSales(), getAllItems()]);
      setSales(salesData);
      setItems(itemsData);

      // Only seed the date range from the data on first load — a later refresh
      // (after editing/deleting a sale) must keep the user's selected range.
      if (resetRange) {
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

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
    `${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Transactions</h1>

        <div className={styles.content}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} />
              <input
                aria-label="Search"
                placeholder="Search"
                disabled
                className={styles.searchInput}
              />
            </div>

            <button type="button" className={styles.btnDownload}>
              <Download className={styles.btnIcon} />
              Download CSV
            </button>
          </div>

          <div className={styles.controls}>
            <div className={styles.control}>
              <button
                type="button"
                onClick={() => setOpenPanel(openPanel === "calendar" ? null : "calendar")}
                className={`${styles.trigger} ${styles.triggerPrimary}`}
              >
                <CalendarDays className={styles.btnIcon} />
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

            <div className={styles.control}>
              <button
                type="button"
                onClick={() => {
                  setDraftFilters(copyFilters(filters));
                  setOpenPanel(openPanel === "filters" ? null : "filters");
                }}
                className={`${styles.trigger} ${
                  openPanel === "filters" || activeFilterCount > 0
                    ? styles.triggerActive
                    : styles.triggerInactive
                }`}
              >
                <Plus className={styles.triggerIconAccent} />
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

            <div className={styles.control}>
              <button
                type="button"
                onClick={() => {
                  setDraftColumns(visibleColumns);
                  setDraftPurchaseColumns(visiblePurchaseColumns);
                  setOpenPanel(openPanel === "columns" ? null : "columns");
                }}
                className={`${styles.trigger} ${
                  openPanel === "columns" ? styles.triggerActive : styles.triggerInactive
                }`}
              >
                {openPanel === "columns" ? (
                  <Columns3 className={styles.triggerIconWhite} />
                ) : (
                  <SlidersHorizontal className={styles.triggerIconAccent} />
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

          <div className={styles.tabsSection}>
            <div className={styles.tabs}>
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
            <div className={styles.tableArea}>
              {loading && (
                <div className={styles.stateLoading}>
                  Loading {activeTab === "purchases" ? "purchases" : "sales"}...
                </div>
              )}
              {error && (
                <div className={styles.stateError}>Error: {error}</div>
              )}
              {!loading && !error && activeTab === "purchases" && (
                <PurchaseTable items={filteredItems} visibleColumns={visiblePurchaseColumns} />
              )}
              {!loading && !error && activeTab === "sales" && (
                <SalesTable
                  sales={filteredSales}
                  visibleColumns={visibleColumns}
                  onChanged={() => loadData()}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
