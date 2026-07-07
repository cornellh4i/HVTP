"use client";

import { Item } from "@/api/items";
import { PurchaseColumnKey, getPurchaseValue, purchaseColumnLabels } from "../transaction-utils";
import styles from "./purchase-table.module.css";

type PurchaseTableProps = {
  items: Item[];
  visibleColumns: PurchaseColumnKey[];
};

export default function PurchaseTable({ items, visibleColumns }: PurchaseTableProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headRow}>
              {visibleColumns.map((column) => (
                <th key={column} className={styles.headCell}>
                  <span className={styles.headLabel}>{purchaseColumnLabels[column]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className={styles.emptyCell}>
                  No purchases found for the selected date range.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${styles.row} ${index % 2 === 1 ? styles.rowAlt : styles.rowDefault}`}
                >
                  {visibleColumns.map((column) => (
                    <td key={column} className={styles.cell}>
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
