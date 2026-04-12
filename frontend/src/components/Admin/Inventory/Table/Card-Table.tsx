import { ItemCard } from "@/components/ui/itemCard";
import { getAllItems, Item } from "@/api/items";
import { useState, useEffect } from "react";
// To get this information you would have to use item and
// farmers information and possible add more fields

function formatDate(createdAt: unknown): string | undefined {
  if (!createdAt) return undefined;
  const ts = createdAt as { _seconds?: number };
  const ms = ts._seconds ? ts._seconds * 1000 : Number(createdAt);
  const date = new Date(ms);
  return isNaN(date.getTime()) ? undefined : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CardTable({ searchQuery = "" }: { searchQuery?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllItems();
        setItems(data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) return <main className="min-h-screen p-8">Loading...</main>;
  if (error) return <main className="min-h-screen p-8">Error: {error}</main>;

  const filtered = searchQuery
    ? items.filter(
        (item) =>
          item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.breed?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  return (
    <main className="min-h-screen p-8">
      <div className="flex flex-col items-center justify-centergrid grid-cols-1 gap-4">
        {filtered.map((item) => (
          <ItemCard
            key={item.id}
            sku={item.sku}
            description={`${item.grade ?? ""} • ${item.color ?? ""}`}
            breed={item.breed ?? ""}
            quantity={`${item.weight} lbs`}
            status={item.status ?? ""}
            state={item.farmerState ?? ""}
            href={`/inventory/${item.id}`}
            lastUpdated={formatDate(item.createdAt)}
          />
        ))}
      </div>
    </main>
  );
}
