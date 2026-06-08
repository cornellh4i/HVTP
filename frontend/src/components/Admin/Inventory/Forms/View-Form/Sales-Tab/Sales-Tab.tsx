"use client";

import { Item } from "@/api/items";
import { Sale } from "@/api/sales";

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value ?? 0);

const formatWeight = (value?: number, unit?: "kg" | "lb") => {
  const weight = value ?? 0;
  const suffix = unit === "kg" ? "kg" : "lbs";
  return `${weight.toLocaleString("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(weight) ? 0 : 1,
  })} ${suffix}`;
};

type SalesTabProps = {
  item: Item;
  formData: Partial<Item>;
  sales: Sale[];
  salesLoading: boolean;
};

export default function SalesTab({
  item,
  formData,
  sales,
  salesLoading,
}: SalesTabProps) {
  return (
    <section>
      <div className="overflow-hidden rounded-md border border-[#b8b8b2] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="h-14 border-b border-[#d8d7cf] bg-white shadow-sm">
                <th className="whitespace-nowrap px-7 text-base font-semibold text-black">SKU</th>
                <th className="whitespace-nowrap px-7 text-base font-semibold text-black">Grade</th>
                <th className="whitespace-nowrap px-7 text-base font-semibold text-black">Wool Type</th>
                <th className="whitespace-nowrap px-7 text-base font-semibold text-black">Intake Price</th>
                <th className="whitespace-nowrap px-7 text-base font-semibold text-black">Selling Price</th>
                <th className="whitespace-nowrap px-7 text-base font-semibold text-black">Profit (lot)</th>
                <th className="whitespace-nowrap px-7 text-base font-semibold text-black">Quantity Sold</th>
                <th className="whitespace-nowrap px-7 text-base font-semibold text-black">Buyer</th>
              </tr>
            </thead>
            <tbody>
              {salesLoading ? (
                <tr>
                  <td colSpan={8} className="px-7 py-10 text-center text-sm text-gray-500">
                    Loading sales...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-7 py-10 text-center text-sm text-gray-500">
                    No sales recorded yet.
                  </td>
                </tr>
              ) : (
                sales.map((sale, index) => {
                  const intake = sale.costPerWeight ?? 0;
                  const selling = sale.pricePerWeight ?? 0;
                  const weight = sale.weightSold ?? 0;
                  const profit = (selling - intake) * weight;
                  const rowBg = index % 2 === 1 ? "bg-[#f3f0e8]" : "bg-white";
                  return (
                    <tr
                      key={`${sale.itemId}-${sale.soldAt}-${index}`}
                      className={`h-12 ${rowBg}`}
                    >
                      <td className="whitespace-nowrap px-7 text-[#242424]">
                        {formData.sku ?? item.sku ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-7 text-[#242424]">
                        {formData.grade ?? item.grade ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-7 text-[#242424]">
                        {(formData as Partial<Item> & { type?: string }).type ??
                          item.type ??
                          "-"}
                      </td>
                      <td className="whitespace-nowrap px-7 text-[#242424]">
                        {formatCurrency(intake)}
                      </td>
                      <td className="whitespace-nowrap px-7 text-[#242424]">
                        {formatCurrency(selling)}
                      </td>
                      <td className="whitespace-nowrap px-7 text-[#242424]">
                        {formatCurrency(profit)}
                      </td>
                      <td className="whitespace-nowrap px-7 text-[#242424]">
                        {formatWeight(sale.weightSold, sale.weightUnit)}
                      </td>
                      <td className="whitespace-nowrap px-7 text-[#242424]">
                        {sale.buyerName || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
