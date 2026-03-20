"use client";

import Link from "next/link";

const TEST_ITEM = {
  id: "test-item-001",
  sku: "R9pL2bN5kW",
  breed: "Merino",
  grade: "A",
  color: "White",
  weight: 12,
  status: "Processing",
};

export default function InventoryPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Inventory</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Test item card — replace with real data in implementation ticket */}
        <div className="border rounded-lg p-4 space-y-2 bg-white shadow-sm">
          <p className="text-xs text-gray-400 font-mono">SKU: {TEST_ITEM.sku}</p>
          <h2 className="text-lg font-semibold">{TEST_ITEM.breed}</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Grade: {TEST_ITEM.grade}</p>
            <p>Color: {TEST_ITEM.color}</p>
            <p>Weight: {TEST_ITEM.weight} lb</p>
            <p>Status: {TEST_ITEM.status}</p>
          </div>
          <Link
            href={`/inventory/${TEST_ITEM.id}`}
            className="inline-block mt-2 rounded bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-700"
          >
            View More
          </Link>
        </div>
      </div>
    </main>
  );
}
