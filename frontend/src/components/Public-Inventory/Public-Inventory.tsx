"use client";

import React, { useEffect, useState } from "react";
import { getPublicItems, Item } from "@/api/items";
import ItemCard from "./public-itemCard";

export default function PublicInventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getPublicItems()
      .then((data) => {
        if (!cancelled) {
          setItems(data ?? []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? "Failed to load public inventory.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Public Inventory</h1>
          <p className="mt-2 text-sm text-slate-600">
            Browse public fiber inventory cards. 
          </p>
        </header>

        {loading ? (
          <p className="text-slate-500">Loading public inventory...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : items.length === 0 ? (
          <p className="text-slate-500">No public items are available right now.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-center">
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
