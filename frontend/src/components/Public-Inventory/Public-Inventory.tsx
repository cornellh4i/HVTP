"use client";

import { useEffect, useState } from "react";
import { getPublicItems, type Item } from "@/api/items";
import CardTable from "./Card-Table";
import SheetTable from "./Sheet-Table";
import Filter from "./Filter";
import SearchBar from "@/components/ui/searchBar";
import {
  defaultInventoryFilters,
  filterInventoryItems,
  getInventoryFilterOptions,
  InventoryFilters,
} from "@/components/Admin/Inventory/inventory-utils";

export default function PublicInventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"card" | "sheet">("card");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<InventoryFilters>(defaultInventoryFilters);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getPublicItems();
        if (active) setItems(data);
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : "Failed to load inventory");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filterOptions = getInventoryFilterOptions(items);
  const filteredItems = filterInventoryItems(items, search, filters);

  const totalWeight = filteredItems.reduce(
    (sum, i) => sum + (parseFloat(String(i.weight ?? 0)) || 0),
    0
  );

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto w-full max-w-[1273px]">

        {/* ── Title + view toggle ─────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Inventory</h1>

          <div className="flex h-8 w-[124px] items-stretch overflow-hidden rounded-[10px] border border-slate-500 bg-white">
            <button
              type="button"
              onClick={() => setMode("card")}
              className={`flex h-full flex-1 items-center justify-center border-r border-slate-300 transition-colors ${
                mode === "card"
                  ? "bg-[#646D72] text-white"
                  : "bg-white text-[#646D72] hover:bg-slate-50"
              }`}
              aria-label="Card view"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2.5V17.5M2.5 10H17.5M4.16667 2.5H15.8333C16.7538 2.5 17.5 3.24619 17.5 4.16667V15.8333C17.5 16.7538 16.7538 17.5 15.8333 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V4.16667C2.5 3.24619 3.24619 2.5 4.16667 2.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setMode("sheet")}
              className={`flex h-full flex-1 items-center justify-center transition-colors ${
                mode === "sheet"
                  ? "bg-[#646D72] text-white"
                  : "bg-white text-[#646D72] hover:bg-slate-50"
              }`}
              aria-label="Sheet view"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path
                  d="M13.3333 4.16663H2.5M13.3333 9.99996H2.5M13.3333 15.8333H2.5M17.5 4.16663H17.5083M17.5 9.99996H17.5083M17.5 15.8333H17.5083"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Search + filter ─────────────────────────────────────────────────── */}
        <div className="mb-4 flex flex-col gap-4">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for item"
            className="w-full max-w-120"
          />
          <Filter filters={filters} options={filterOptions} onChange={setFilters} />
        </div>

        {/* ── Totals ──────────────────────────────────────────────────────────── */}
        <p className="mb-8 text-sm text-gray-500">
          {loading
            ? "Loading…"
            : `Total Lots: ${filteredItems.length}  Total lbs: ${totalWeight.toLocaleString()} lbs`}
        </p>

        {/* ── Content ─────────────────────────────────────────────────────────── */}
        {loading && <p className="text-gray-500">Loading…</p>}
        {!loading && error && <p className="text-red-600">{error}</p>}
        {!loading && !error && filteredItems.length === 0 && (
          <p className="text-gray-500">No items match your filters.</p>
        )}
        {!loading && !error && filteredItems.length > 0 && (
          <>
            {mode === "card" ? (
              <CardTable items={filteredItems} />
            ) : (
              <SheetTable items={filteredItems} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
