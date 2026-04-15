"use client";

import { useEffect, useState } from "react";
import { getPublicItems, type Item } from "@/api/items";
import CardTable from "./Card-Table";
import SheetTable from "./Sheet-Table";

export default function PublicInventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"card" | "sheet">("card");

  useEffect(() => {
    let active = true;

    const loadItems = async () => {
      try {
        const publicItems = await getPublicItems();
        if (!active) return;
        setItems(publicItems);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load inventory");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto w-full max-w-[1273px]">
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
              aria-label="Show vertical cards"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
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
              aria-label="Show horizontal sheet"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
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

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && error && <p className="text-red-600">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="text-gray-500">No public inventory available.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <>{mode === "card" ? <CardTable items={items} /> : <SheetTable items={items} />}</>
        )}
      </div>
    </main>
  );
}
