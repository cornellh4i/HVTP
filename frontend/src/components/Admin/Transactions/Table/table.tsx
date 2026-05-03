"use client";

import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { Sale } from "@/api/sales";
import { ColumnKey, columnLabels, getSaleValue } from "../transaction-utils";

type SalesTableProps = {
  sales: Sale[];
  visibleColumns: ColumnKey[];
};

export default function SalesTable({ sales, visibleColumns }: SalesTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-[#b8b8b2] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="h-14 border-b border-[#d8d7cf] bg-white shadow-sm">
              {visibleColumns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-7 text-base font-semibold text-black"
                >
                  <span className="inline-flex items-center gap-1">
                    {columnLabels[column]}
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
            {sales.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-7 py-10 text-center text-sm text-gray-500"
                >
                  No sales found for the selected date range.
                </td>
              </tr>
            ) : (
              sales.map((sale, index) => (
                <tr
                  key={sale.id}
                  className={`h-12 ${index % 2 === 1 ? "bg-[#f3f0e8]" : "bg-white"}`}
                >
                  {visibleColumns.map((column) => (
                    <td key={column} className="whitespace-nowrap px-7 text-[#242424]">
                      {getSaleValue(sale, column)}
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
