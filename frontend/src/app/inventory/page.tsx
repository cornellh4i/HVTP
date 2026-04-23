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
    <main className="pb-8">
      <h1 className="px-4 pt-8 text-4xl font-bold tracking-[-0.03em] sm:px-8 sm:text-6xl">
        Inventory
      </h1>
      <div className="px-4 pt-6 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full lg:w-[520px]"
          />
          <div className="flex items-center gap-4 self-start lg:self-auto">
            <Link
              href="/inventory/add"
              className="flex h-11 shrink-0 items-center gap-1 rounded-2xl bg-[#556b2f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#445523]"
            >
              <Plus size={16} />
              Add Lot
            </Link>
            <div className="flex items-center gap-1 rounded-2xl border border-[#556b2f] bg-white p-1">
              <button
                onClick={() => setMode("view")}
                className={`rounded-lg p-2 transition-colors ${
                  mode === "view"
                    ? "bg-[#556b2f] text-white"
                    : "text-[#556b2f] hover:bg-[#f4f6ee]"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setMode("list")}
                className={`rounded-lg p-2 transition-colors ${
                  mode === "list"
                    ? "bg-[#556b2f] text-white"
                    : "text-[#556b2f] hover:bg-[#f4f6ee]"
                }`}
              >
                <AlignJustify size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Filter filters={filters} options={filterOptions} onChange={setFilters} />
        </div>
      </div>
      <div className="mx-4 mt-6 border-t border-[#d8d5cc] pt-5 text-sm text-slate-500 sm:mx-8">
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
