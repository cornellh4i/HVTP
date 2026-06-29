"use client";

import { useEffect, useState } from "react";
import { ArrowDownAZ, ArrowUpAZ, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Sale, deleteSale } from "@/api/sales";
import { ColumnKey, columnLabels, getSaleValue } from "../transaction-utils";
import SaleModal from "@/components/Admin/Inventory/Forms/Add-Sale";
import styles from "./table.module.css";

type SalesTableProps = {
  sales: Sale[];
  visibleColumns: ColumnKey[];
  onChanged: () => void;
};

const MENU_WIDTH = 144; // matches .menu width (w-36)

export default function SalesTable({ sales, visibleColumns, onChanged }: SalesTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Close the kebab menu on any outside click, scroll, or resize.
  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [openMenuId]);

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>, saleId: string) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    // Fixed positioning escapes the table's overflow clipping.
    setMenuPos({ top: rect.bottom + 4, left: rect.right - MENU_WIDTH });
    setOpenMenuId((current) => (current === saleId ? null : saleId));
  };

  const activeSale = sales.find((sale) => sale.id === openMenuId) ?? null;

  const handleConfirmDelete = async () => {
    if (!saleToDelete) return;
    try {
      setDeleting(true);
      await deleteSale(saleToDelete.id);
      setSaleToDelete(null);
      onChanged();
    } catch (err) {
      console.error("deleteSale error:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
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
                <th className={styles.actionHeadCell} aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className={styles.emptyCell}>
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
                    <td className={styles.actionCell}>
                      <button
                        type="button"
                        aria-label="Sale actions"
                        className={styles.kebabBtn}
                        onClick={(event) => openMenu(event, sale.id)}
                      >
                        <MoreVertical className={styles.kebabIcon} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openMenuId && menuPos && activeSale && (
        <div
          className={styles.menu}
          style={{ top: menuPos.top, left: menuPos.left }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className={styles.menuItem}
            onClick={() => {
              setSaleToEdit(activeSale);
              setOpenMenuId(null);
            }}
          >
            <Pencil className={styles.menuIcon} />
            Edit
          </button>
          <button
            type="button"
            className={`${styles.menuItem} ${styles.menuItemDanger}`}
            onClick={() => {
              setSaleToDelete(activeSale);
              setOpenMenuId(null);
            }}
          >
            <Trash2 className={styles.menuIcon} />
            Delete
          </button>
        </div>
      )}

      {saleToDelete && (
        <div
          className={styles.modalBackdrop}
          onClick={() => !deleting && setSaleToDelete(null)}
        >
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-sale-title"
          >
            <svg
              className={styles.modalIcon}
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M16 10.5V18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="16" cy="21.5" r="1" fill="currentColor" />
            </svg>
            <h2 id="delete-sale-title" className={styles.modalTitle}>
              Delete this sale?
            </h2>
            <p className={styles.modalDescription}>
              Deleting a sale is a permanent action that cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className={styles.modalConfirm}
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
              <button
                type="button"
                onClick={() => setSaleToDelete(null)}
                disabled={deleting}
                className={styles.modalCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {saleToEdit && (
        <SaleModal
          itemId={saleToEdit.itemId}
          costPerWeight={saleToEdit.costPerWeight}
          editSale={saleToEdit}
          onClose={() => setSaleToEdit(null)}
          onSaleUpdated={() => {
            setSaleToEdit(null);
            onChanged();
          }}
        />
      )}
    </>
  );
}
