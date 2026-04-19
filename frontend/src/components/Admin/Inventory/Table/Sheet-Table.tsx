"use client";

import { getAllItems, Item } from "@/api/items";
import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SquarePen } from "lucide-react";

export default function SheetTable({
  searchQuery = "",
}: {
  searchQuery?: string;
}) {
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
          item.breed?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : items;

  return (
    <main className="min-h-screen p-8">
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-900">
              <th className="text-left px-4 py-3 font-medium text-black-500">
                SKU
              </th>
              <th className="text-left px-4 py-3 font-medium text-black-500">
                Grade
              </th>
              <th className="text-left px-4 py-3 font-medium text-black-500">
                Breed
              </th>
              <th className="text-left px-4 py-3 font-medium text-black-500">
                Color
              </th>
              <th className="text-left px-4 py-3 font-medium text-black-500">
                Type
              </th>
              <th className="text-left px-4 py-3 font-medium text-black-500">
                Quantity
              </th>
              <th className="text-left px-4 py-3 font-medium text-black-500">
                Edit
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, index) => (
              <Sheet key={item.id}>
                <tr
                  className={`${index % 2 === 1 ? "bg-[#ECE7D6]" : "bg-white"}`}
                >
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          item.status === "active"
                            ? "bg-[#3A4F0D]"
                            : "bg-[#900B09]"
                        }`}
                      />
                      {item.sku}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.grade}</td>
                  <td className="px-4 py-3">{item.breed}</td>
                  <td className="px-4 py-3">{item.color}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">{item.weight} lbs</td>
                  <td className="px-4 py-3">
                    <button className="text-gray-500/50 hover:text-gray-500/75">
                      <SquarePen className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
                <SheetContent side="right"></SheetContent>
              </Sheet>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
