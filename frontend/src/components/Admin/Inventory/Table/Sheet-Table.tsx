"use client";

import { Item } from "@/api/items";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SquarePen } from "lucide-react";

export default function SheetTable({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <main className="min-h-screen p-8">
        <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            No inventory items match the current filters.
          </p>
        </div>
      </main>
    );
  }

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
            {items.map((item, index) => (
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
