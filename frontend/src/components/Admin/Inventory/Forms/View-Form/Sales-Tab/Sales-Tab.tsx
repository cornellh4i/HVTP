"use client";

import { Item } from "@/api/items";
import { Sale } from "@/api/sales";
import { Card } from "@/components/ui/card";

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
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return dateFormatter.format(d);
};

const formatOptional = (value?: string) => (value?.trim() ? value.trim() : "—");

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
  if (salesLoading) {
    return (
      <section>
        <div className="rounded-md border border-[#b8b8b2] bg-white px-7 py-10 text-center text-sm text-gray-500">
          Loading sales...
        </div>
      </section>
    );
  }

  if (sales.length === 0) {
    return (
      <section>
        <div className="rounded-md border border-[#b8b8b2] bg-white px-7 py-10 text-center text-sm text-gray-500">
          No sales recorded yet.
        </div>
      </section>
    );
  }

  return (
    <section>
      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {sales.map((sale, index) => (
          <Card
            key={`${sale.itemId}-${sale.soldAt}-${index}`}
            className="flex flex-col gap-2 p-4 text-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-black">{formatDate(sale.soldAt)}</span>
              <span className="text-[#242424]">{formatWeight(sale.weightSold, sale.weightUnit)}</span>
            </div>
            <div className="flex items-center justify-between text-[#242424]">
              <span className="text-gray-500">Selling Price</span>
              <span>{formatCurrency(sale.pricePerWeight)}</span>
            </div>
            <div className="flex items-center justify-between text-[#242424]">
              <span className="text-gray-500">Buyer</span>
              <span className="text-right">{formatOptional(sale.buyerName)}</span>
            </div>
            <div className="flex items-center justify-between text-[#242424]">
              <span className="text-gray-500">Phone</span>
              <span className="text-right">{formatOptional(sale.buyerPhone)}</span>
            </div>
            <div className="flex items-center justify-between text-[#242424]">
              <span className="text-gray-500">Email</span>
              <span className="break-all text-right">{formatOptional(sale.buyerEmail)}</span>
            </div>
            <div className="flex items-start justify-between text-[#242424]">
              <span className="flex-none text-gray-500">Address</span>
              <span className="ml-3 text-right">{formatOptional(sale.buyerAddress)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-md border border-[#b8b8b2] bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <thead>
              <tr className="h-14 border-b border-[#d8d7cf] bg-white shadow-sm">
                <th className="w-[10%] whitespace-nowrap px-7 text-left text-base font-semibold text-black">Date</th>
                <th className="w-[10%] whitespace-nowrap px-7 text-right text-base font-semibold text-black">Quantity</th>
                <th className="w-[10%] whitespace-nowrap px-7 text-right text-base font-semibold text-black">Selling Price</th>
                <th className="w-[12%] whitespace-nowrap px-7 text-left text-base font-semibold text-black">Buyer</th>
                <th className="w-[12%] whitespace-nowrap px-7 text-left text-base font-semibold text-black">Phone</th>
                <th className="w-[18%] whitespace-nowrap px-7 text-left text-base font-semibold text-black">Email</th>
                <th className="w-[28%] whitespace-nowrap px-7 text-left text-base font-semibold text-black">Address</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, index) => {
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
                      {formatOptional(sale.buyerName)}
                    </td>
                    <td className="whitespace-nowrap px-7 text-left text-[#242424]">
                      {formatOptional(sale.buyerPhone)}
                    </td>
                    <td className="whitespace-nowrap px-7 text-left text-[#242424]">
                      {formatOptional(sale.buyerEmail)}
                    </td>
                    <td className="px-7 text-left text-[#242424]">
                      {formatOptional(sale.buyerAddress)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
