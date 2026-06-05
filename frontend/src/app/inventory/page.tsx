"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, AlignJustify, Plus } from "lucide-react";
import Link from "next/link";

import { getAllItems, Item } from "@/api/items";
import CardTable from "@/components/Admin/Inventory/Table/Card-Table/Card-Table";
import SheetTable from "@/components/Admin/Inventory/Table/Sheet-Table";
import Filter from "@/components/Public-Inventory/Filter";
import SearchBar from "@/components/ui/searchBar";
import {
  defaultInventoryFilters,
  filterInventoryItems,
  getInventoryFilterOptions,
  InventoryFilters,
} from "@/components/Admin/Inventory/inventory-utils";
import styles from "./page.module.css";

type ViewMode = "view" | "list";

export default function InventoryPage() {
  const [mode, setMode] = useState<ViewMode>("view");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [filters, setFilters] = useState<InventoryFilters>(defaultInventoryFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllItems();

        if (!cancelled) {
          setItems(data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, []);

  const filterOptions = getInventoryFilterOptions(items);
  const filteredItems = filterInventoryItems(items, search, filters);

  return (
    <main className={styles.pageMain}>
      <h1 className={styles.heading}>
        Inventory
      </h1>
      <div className={styles.topControls}>
        <div className={styles.controlsRow}>
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className={styles.searchBar}
            scanHref="/scan"
          />
          <div className={styles.rightControls}>
            <Link
              href="/inventory/add"
              className={styles.addButton}
            >
              <Plus size={16} />
              Add Lot
            </Link>
            <div className={styles.viewToggle}>
              <button
                onClick={() => setMode("view")}
                className={`${styles.viewToggleButton} ${
                  mode === "view"
                    ? styles.viewToggleButtonActive
                    : styles.viewToggleButtonInactive
                } rounded-l-lg`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setMode("list")}
                className={`${styles.viewToggleButton} ${
                  mode === "list"
                    ? styles.viewToggleButtonActive
                    : styles.viewToggleButtonInactive
                } rounded-r-lg -ml-px`}
              >
                <AlignJustify size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.filterWrapper}>
          <Filter filters={filters} options={filterOptions} onChange={setFilters} />
        </div>
      </div>
      <div className={styles.itemCount}>
        {loading
          ? "Loading inventory..."
          : error
            ? `Error: ${error}`
            : `${filteredItems.length} of ${items.length} lots shown`}
      </div>
      {loading ? (
        <main className={styles.loadingMain}>Loading...</main>
      ) : error ? (
        <main className={styles.errorMain}>Error: {error}</main>
      ) : mode === "view" ? (
        <CardTable items={filteredItems} />
      ) : (
        <SheetTable items={filteredItems} />
      )}
    </main>
  );
}
