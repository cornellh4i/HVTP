import Link from "next/link";
import { ItemCard } from "@/components/ui/itemCard";
// To get this information you would have to use item and
// farmers information and possible add more fields

export default function InventoryPage() {
  // To get this information you would have to use item and
  // farmers information and possible add >more fields
  const TEST_ITEM = {
    id: "test-item-001",
    sku: "R9pL2bN5kW",
    breed: "Merino",
    grade: "A",
    color: "White",
    weight: 12,
    status: "Processing",
    state: "NY",
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Inventory</h1>
      <div className="flex flex-col items-center justify-centergrid grid-cols-1 gap-4">
        {/* Test item card — replace with real data in implementation ticket */}
        <ItemCard
          sku={TEST_ITEM.sku}
          description={TEST_ITEM.grade + " " + TEST_ITEM.color}
          breed={TEST_ITEM.breed}
          quantity={`${TEST_ITEM.weight} lbs`}
          status={TEST_ITEM.status}
          state={TEST_ITEM.state}
          href={`/inventory/${TEST_ITEM.id}`}
        />
      </div>
    </main>
  );
}
