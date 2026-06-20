"use client";

import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { Item } from "@/api/items";
import { PurchaseColumnKey, getPurchaseValue, purchaseColumnLabels } from "../transaction-utils";

type PurchaseTableProps = {
  items: Item[];
  visibleColumns: PurchaseColumnKey[];
};

export default function PurchaseTable({ items, visibleColumns }: PurchaseTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-[#b8b8b2] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="h-14 border-b border-[#d8d7cf] bg-white shadow-sm">
              {visibleColumns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-7 text-base font-semibold text-black"
                >
                  <span className="inline-flex items-center gap-1">
                    {purchaseColumnLabels[column]}
                    {(column === "grade" || column === "woolType") && (
                      <span className="inline-flex items-center -space-x-2">
                        <ArrowUpAZ className="h-4 w-4" />
                        <ArrowDownAZ className="h-4 w-4" />
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-7 py-10 text-center text-sm text-gray-500"
                >
                  No purchases found for the selected date range.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr
                  key={item.id}
                  className={`h-12 ${index % 2 === 1 ? "bg-[#f3f0e8]" : "bg-white"}`}
                >
                  {visibleColumns.map((column) => (
                    <td key={column} className="whitespace-nowrap px-7 text-[#242424]">
                      {getPurchaseValue(item, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
