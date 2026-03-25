"use client";

import Link from "next/link";
import { ImageIcon } from "lucide-react";

// TODO: Replace with real data fetched using params.id
const PLACEHOLDER_ITEM = {
  sku: "R9pL2bN5kW",
  breed: "",
  grade: "",
  color: "",
  weight: "",
  palletNumber: "",
  status: "",
  notes: "",
  farmerName: "",
  farmerContact: "",
  farmerCity: "",
  farmerState: "",
  purchasePrice: "",
  shearDate: "",
};

export default function ItemPage({ params }: { params: { id: string } }) {
  const item = PLACEHOLDER_ITEM;

  return (
    <main className="min-h-screen p-8">
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
