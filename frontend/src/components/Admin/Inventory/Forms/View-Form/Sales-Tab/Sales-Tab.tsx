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

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const formatDate = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return dateFormatter.format(d);
};

type SalesTabProps = {
  item: Item;
  formData: Partial<Item>;
  sales: Sale[];
  salesLoading: boolean;
};

export default function SalesTab({
  item: _item,
  formData: _formData,
  sales,
  salesLoading,
}: SalesTabProps) {
  void _item;
  void _formData;
  return (
    <section>
      <div className="overflow-hidden rounded-md border border-[#b8b8b2] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <thead>
              <tr className="h-14 border-b border-[#d8d7cf] bg-white shadow-sm">
                <th className="w-[12%] whitespace-nowrap px-7 text-left text-base font-semibold text-black">Date</th>
                <th className="w-[12%] whitespace-nowrap px-7 text-right text-base font-semibold text-black">Quantity</th>
                <th className="w-[14%] whitespace-nowrap px-7 text-right text-base font-semibold text-black">Selling Price</th>
                <th className="w-[18%] whitespace-nowrap px-7 text-left text-base font-semibold text-black">Buyer</th>
                <th className="w-[18%] whitespace-nowrap px-7 text-left text-base font-semibold text-black">Phone</th>
                <th className="w-[26%] whitespace-nowrap px-7 text-left text-base font-semibold text-black">Email</th>
              </tr>
            </thead>
            <tbody>
              {salesLoading ? (
                <tr>
                  <td colSpan={6} className="px-7 py-10 text-center text-sm text-gray-500">
                    Loading sales...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-7 py-10 text-center text-sm text-gray-500">
                    No sales recorded yet.
                  </td>
                </tr>
              ) : (
                sales.map((sale, index) => {
                  const rowBg = index % 2 === 1 ? "bg-[#f3f0e8]" : "bg-white";
                  return (
                    <tr
                      key={`${sale.itemId}-${sale.soldAt}-${index}`}
                      className={`h-12 ${rowBg}`}
                    >
                      <td className="whitespace-nowrap px-7 text-left text-[#242424]">
                        {formatDate(sale.soldAt)}
                      </td>
                      <td className="whitespace-nowrap px-7 text-right text-[#242424]">
                        {formatWeight(sale.weightSold, sale.weightUnit)}
                      </td>
                      <td className="whitespace-nowrap px-7 text-right text-[#242424]">
                        {formatCurrency(sale.pricePerWeight)}
                      </td>
                      <td className="whitespace-nowrap px-7 text-left text-[#242424]">
                        {sale.buyerName || "-"}
                      </td>
                      <td className="whitespace-nowrap px-7 text-left text-[#242424]">
                        {sale.buyerPhone || "-"}
                      </td>
                      <td className="whitespace-nowrap px-7 text-left text-[#242424]">
                        {sale.buyerEmail || "-"}
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
