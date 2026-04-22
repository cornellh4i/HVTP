"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, AlignJustify, Plus } from "lucide-react";
import Link from "next/link";

import { getAllItems, Item } from "@/api/items";
import CardTable from "@/components/Admin/Inventory/Table/Card-Table";
import SheetTable from "@/components/Admin/Inventory/Table/Sheet-Table";
import Filter from "@/components/Public-Inventory/Filter";
import SearchBar from "@/components/ui/searchBar";
import {
  defaultInventoryFilters,
  filterInventoryItems,
  getInventoryFilterOptions,
  InventoryFilters,
} from "@/components/Admin/Inventory/inventory-utils";

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
    <main>
      <h1 className="px-4 pt-8 text-3xl font-bold sm:px-8 sm:text-4xl">Inventory</h1>
      <div className="flex flex-col gap-3 px-4 pt-4 sm:px-8 lg:flex-row lg:items-center">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="w-full lg:w-96"
        />
        <div className="flex flex-wrap items-center gap-3 lg:ml-auto lg:flex-nowrap">
          <div className="order-2 lg:order-1">
            <Filter filters={filters} options={filterOptions} onChange={setFilters} />
          </div>
          <Link
            href="/inventory/add"
            className="order-3 flex h-11 items-center gap-1 rounded-xl bg-[#556b2f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#445523] shrink-0 lg:order-2"
          >
            <Plus size={16} />
            Add Lot
          </Link>
          <div className="order-1 flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1 lg:order-3">
            <button
              onClick={() => setMode("view")}
              className={`rounded-lg p-2 transition-colors ${
                mode === "view"
                  ? "bg-[#556b2f] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setMode("list")}
              className={`rounded-lg p-2 transition-colors ${
                mode === "list"
                  ? "bg-[#556b2f] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <AlignJustify size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="px-4 pt-4 text-sm text-slate-500 sm:px-8">
        {loading
          ? "Loading inventory..."
          : error
            ? `Error: ${error}`
            : `${filteredItems.length} of ${items.length} lots shown`}
      </div>
      {loading ? (
        <main className="min-h-[40vh] px-4 py-8 sm:px-8">Loading...</main>
      ) : error ? (
        <main className="min-h-[40vh] px-4 py-8 text-red-500 sm:px-8">Error: {error}</main>
      ) : mode === "view" ? (
        <CardTable items={filteredItems} />
      ) : (
        <SheetTable items={filteredItems} />
      )}
    </main>
  );
}
