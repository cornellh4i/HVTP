"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Columns3,
  Download,
  Search,
  X,
} from "lucide-react";
import { getAllItems, Item } from "@/api/items";
import { getAllSales, Sale } from "@/api/sales";
import TransactionsFilterBar from "./TransactionsFilterBar";
import {
  InventoryFilters,
  defaultInventoryFilters,
  getInventoryFilterOptions,
  filterInventoryItems,
} from "@/components/Admin/Inventory/inventory-utils";
import Calendar from "./Calendar/calendar";
import PurchaseTable from "./Table/purchase-table";
import SalesTable from "./Table/table";
import {
  ColumnKey,
  DateRange,
  PurchaseColumnKey,
  TabKey,
  columnLabels,
  defaultColumns,
  defaultPurchaseColumns,
  filterSales,
  formatCurrency,
  formatQuantity,
  formatRange,
  getItemDate,
  getSaleDate,
  getSalesFilterOptions,
  isItemWithinRange,
  isWithinRange,
  purchaseColumnLabels,
  sortItemsByDate,
} from "./transaction-utils";
import styles from "./transactions.module.css";

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
    { label: "TOTAL REVENUE", value: formatCurrency(totals.revenue) },
    { label: "TOTAL COST", value: formatCurrency(totals.cost) },
    { label: "TOTAL PROFIT", value: formatCurrency(totals.revenue - totals.cost) },
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
  const [openPanel, setOpenPanel] = useState<"calendar" | "columns" | null>(null);
  const [invFilters, setInvFilters] = useState<InventoryFilters>(defaultInventoryFilters);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(defaultColumns);
  const [draftColumns, setDraftColumns] = useState<ColumnKey[]>(defaultColumns);
  const [visiblePurchaseColumns, setVisiblePurchaseColumns] =
    useState<PurchaseColumnKey[]>(defaultPurchaseColumns);
  const [draftPurchaseColumns, setDraftPurchaseColumns] =
    useState<PurchaseColumnKey[]>(defaultPurchaseColumns);

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

  const filterOptions = useMemo(
    () => (activeTab === "purchases" ? getInventoryFilterOptions(items) : getSalesFilterOptions(sales)),
    [items, sales, activeTab]
  );

  const filteredSales = useMemo(() => {
    const inRange = sales.filter((sale) => isWithinRange(sale, dateRange));
    return filterSales(inRange, invFilters);
  }, [sales, dateRange, invFilters]);

  const filteredItems = useMemo(() => {
    const inRange = items.filter((item) => isItemWithinRange(item, dateRange));
    const filtered = filterInventoryItems(inRange, "", invFilters);
    return sortItemsByDate(filtered, invFilters.sortBy);
  }, [items, dateRange, invFilters]);

  const setSortDirection = (sortBy: InventoryFilters["sortBy"]) =>
    setInvFilters((current) => ({ ...current, sortBy }));

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
              Export
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

            <TransactionsFilterBar
              filters={invFilters}
              options={filterOptions}
              onChange={setInvFilters}
              sortToggle={
                <div className={styles.sortToggle}>
                  <button
                    type="button"
                    aria-label="Sort descending"
                    aria-pressed={invFilters.sortBy === "date-desc"}
                    onClick={() => setSortDirection("date-desc")}
                    className={`${styles.sortToggleButton} ${
                      invFilters.sortBy === "date-desc" ? styles.sortToggleActive : ""
                    }`}
                  >
                    <ArrowDown className={styles.btnIcon} />
                  </button>
                  <button
                    type="button"
                    aria-label="Sort ascending"
                    aria-pressed={invFilters.sortBy === "date-asc"}
                    onClick={() => setSortDirection("date-asc")}
                    className={`${styles.sortToggleButton} ${
                      invFilters.sortBy === "date-asc" ? styles.sortToggleActive : ""
                    }`}
                  >
                    <ArrowUp className={styles.btnIcon} />
                  </button>
                </div>
              }
            />

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
                <Columns3
                  className={
                    openPanel === "columns" ? styles.triggerIconWhite : styles.triggerIconAccent
                  }
                />
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

          <Summary sales={filteredSales} items={filteredItems} activeTab={activeTab} />

          <div className={styles.tabsSection}>
            <div className={styles.tabs}>
              <button
                type="button"
                className={tabButtonClass("purchases")}
                onClick={() => setActiveTab("purchases")}
              >
                Purchases
              </button>
              <button
                type="button"
                className={tabButtonClass("sales")}
                onClick={() => setActiveTab("sales")}
              >
                Sales
              </button>
            </div>
            <div className={styles.tableArea}>
              {loading && (
                <div className={styles.stateLoading}>
                  Loading {activeTab === "purchases" ? "purchases" : "sales"}...
                </div>
              )}
              {error && <div className={styles.stateError}>Error: {error}</div>}
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
