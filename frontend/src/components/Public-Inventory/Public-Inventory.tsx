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
import Link from "next/link";
import { LayoutGrid, AlignJustify, Plus } from "lucide-react";

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
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          ← Back to Inventory
        </Link>

        {/* ── Title ─────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-4xl font-bold">Inventory</h1>
        </div>

        {/* ── Toggle Button + Search + filter ─────────────────────────────────────────────────── */}
        <div className="mb-4 flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for item"
              className="w-full max-w-120"
            />
            
            <div className="flex items-center gap-4 self-start lg:self-auto">
              <div className="flex items-center gap-1 rounded-2xl border border-[#556b2f] bg-white p-1">
                <button
                  onClick={() => setMode("card")}
                  className={`rounded-lg p-2 transition-colors ${
                    mode === "card"
                      ? "bg-[#556b2f] text-white"
                      : "text-[#556b2f] hover:bg-[#f4f6ee]"
                  }`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setMode("sheet")}
                  className={`rounded-lg p-2 transition-colors ${
                    mode === "sheet"
                      ? "bg-[#556b2f] text-white"
                      : "text-[#556b2f] hover:bg-[#f4f6ee]"
                  }`}
                >
                  <AlignJustify size={16} />
                </button>
              </div>
            </div>
          </div>
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
