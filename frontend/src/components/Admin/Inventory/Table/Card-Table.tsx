import { ItemCard } from "@/components/ui/itemCard";
import { Item } from "@/api/items";
import { formatItemDate } from "@/components/Admin/Inventory/inventory-utils";

export default function CardTable({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <main className="min-h-[40vh] px-4 py-8 sm:px-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-500">
          No inventory items match the current filters.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            imgSrc={item.coverImage ?? item.images?.[0]}
            sku={item.sku}
            description={`${item.grade ?? ""} • ${item.color ?? ""}`}
            breed={item.breed ?? ""}
            quantity={item.weight ? `${item.weight} lbs` : "-"}
            status={item.status ?? ""}
            state={item.farmerState ?? ""}
            href={`/inventory/${item.id}`}
            lastUpdated={formatItemDate(item.createdAt)}
            ctaLabel="Edit Lot"
          />
        ))}
      </div>
    </main>
  );
}
