import Link from "next/link";

import { Item } from "@/api/items";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatItemDate, getPublicationState } from "@/components/Admin/Inventory/inventory-utils";

export default function SheetTable({ items }: { items: Item[] }) {
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
      <Card className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="hidden grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-700 md:grid">
          <div>SKU</div>
          <div>Breed</div>
          <div>Grade / Color</div>
          <div>Status</div>
          <div>State</div>
          <div className="text-right">Action</div>
        </div>

        <div className="divide-y divide-slate-200">
          {items.map((item) => (
            <div key={item.id} className="px-4 py-4 sm:px-6">
              <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_0.8fr] md:items-center">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {formatItemDate(item.createdAt) ?? "No date"}
                  </p>
                  <p className="text-lg font-semibold text-slate-900">{item.sku}</p>
                </div>
                <div className="text-sm text-slate-700">{item.breed ?? "-"}</div>
                <div className="text-sm text-slate-700">
                  {[item.grade, item.color].filter(Boolean).join(" • ") || "-"}
                </div>
                <div className="text-sm text-slate-700">{item.status ?? "-"}</div>
                <div className="text-sm text-slate-700">{item.farmerState ?? "-"}</div>
                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <span className="rounded-full bg-[#edf4e2] px-3 py-1 text-xs font-medium capitalize text-[#556b2f]">
                    {getPublicationState(item)}
                  </span>
                  <Button asChild size="sm" className="rounded-xl bg-[#556b2f]">
                    <Link href={`/inventory/${item.id}`}>Edit Lot</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
