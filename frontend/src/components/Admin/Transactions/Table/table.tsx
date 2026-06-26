"use client";

import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { Sale } from "@/api/sales";
import { ColumnKey, columnLabels, getSaleValue } from "../transaction-utils";
import styles from "./table.module.css";

type SalesTableProps = {
  sales: Sale[];
  visibleColumns: ColumnKey[];
};

export default function SalesTable({ sales, visibleColumns }: SalesTableProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headRow}>
              {visibleColumns.map((column) => (
                <th key={column} className={styles.headCell}>
                  <span className={styles.headLabel}>
                    {columnLabels[column]}
                    {(column === "grade" || column === "woolType") && (
                      <span className={styles.sortIcons}>
                        <ArrowUpAZ className={styles.sortIcon} />
                        <ArrowDownAZ className={styles.sortIcon} />
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
                <td colSpan={visibleColumns.length} className={styles.emptyCell}>
                  No sales found for the selected date range.
                </td>
              </tr>
            ) : (
              sales.map((sale, index) => (
                <tr
                  key={sale.id}
                  className={`${styles.row} ${index % 2 === 1 ? styles.rowAlt : styles.rowDefault}`}
                >
                  {visibleColumns.map((column) => (
                    <td key={column} className={styles.cell}>
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
