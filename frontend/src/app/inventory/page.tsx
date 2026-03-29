"use client";

import { useState } from "react";
import { LayoutGrid, AlignJustify } from "lucide-react";
import ViewTable from "@/components/Admin/Inventory/Table/View-Table";
import EditTable from "@/components/Admin/Inventory/Table/Edit-Table";

type ViewMode = "view" | "edit";

export default function InventoryPage() {
  const [mode, setMode] = useState<ViewMode>("view");

  return (
    <main>
      <h1 className="text-2xl font-bold p-8">Inventory</h1>

      <div className="flex items-center justify-end px-8 pt-8">
        <div className="flex items-center rounded-full border border-gray-200 bg-gray-100 p-1 gap-1">
          <button
            onClick={() => setMode("view")}
            className={`rounded-full p-1.5 transition-colors ${
              mode === "view"
                ? "bg-gray-700 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setMode("edit")}
            className={`rounded-full p-1.5 transition-colors ${
              mode === "edit"
                ? "bg-gray-700 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <AlignJustify size={16} />
          </button>
        </div>
      </div>
      {mode === "view" ? <ViewTable /> : <EditTable />}
    </main>
  );
}
