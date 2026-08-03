"use client";

import { useState } from "react";
import useSWR from "swr";
import { LayoutGrid, AlignJustify, Plus } from "lucide-react";
import Link from "next/link";

import { getAllItems } from "@/api/items";
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
  const [filters, setFilters] = useState<InventoryFilters>(defaultInventoryFilters);

  const { data: items = [], isLoading: loading, error: fetchError } = useSWR("items", getAllItems);
  const error = fetchError ? (fetchError instanceof Error ? fetchError.message : String(fetchError)) : null;

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
