"use client";

import { useState } from "react";
import { LayoutGrid, AlignJustify, Plus } from "lucide-react";
import Link from "next/link";
import CardTable from "@/components/Admin/Inventory/Table/Card-Table";
import SheetTable from "@/components/Admin/Inventory/Table/Sheet-Table";
import SearchBar from "@/components/ui/searchBar";

type ViewMode = "view" | "list";

export default function InventoryPage() {
  const [mode, setMode] = useState<ViewMode>("view");
  const [search, setSearch] = useState("");

  return (
    <main>
      <h1 className="text-2xl font-bold px-8 pt-8">Inventory</h1>
      <div className="flex items-center gap-3 px-8 pt-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="w-96"
        />
        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/inventory/add"
            className="flex items-center gap-1 bg-[#3d4f2b] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2e3c20] transition-colors shrink-0"
          >
            <Plus size={16} />
            Add Lot
          </Link>
          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-100 p-1 gap-1">
            <button
              onClick={() => setMode("view")}
              className={`rounded-lg p-1.5 transition-colors ${
                mode === "view"
                  ? "bg-[#3d4f2b] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setMode("list")}
              className={`rounded-lg p-1.5 transition-colors ${
                mode === "list"
                  ? "bg-[#3d4f2b] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <AlignJustify size={16} />
            </button>
          </div>
        </div>
      </div>
      {mode === "view" ? (
        <CardTable searchQuery={search} />
      ) : (
        <SheetTable searchQuery={search} />
      )}
    </main>
  );
}
