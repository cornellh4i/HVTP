"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { getItemById, Item } from "@/api/items";

// TODO: Replace with real data fetched using params.id

export default function ItemPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  params = useParams<{ id: string }>();
  const itemId = params.id;

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getItemById(itemId);
        setItem(data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  if (loading) {
    return (
      <main className="min-h-screen p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/inventory"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Inventory
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">Loading...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/inventory"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Inventory
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">{error}</h1>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/inventory"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Inventory
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">Item not found</h1>
      </main>
    );
  }
  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/inventory"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Inventory
        </Link>
        <div className="flex gap-2">
          <button className="rounded border px-4 py-1.5 text-sm hover:bg-gray-50">
            Print Label
          </button>
          <button className="rounded bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-700">
            Publish
          </button>
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-8">SKU: {item.sku}</h1>
    </main>
  );
}
