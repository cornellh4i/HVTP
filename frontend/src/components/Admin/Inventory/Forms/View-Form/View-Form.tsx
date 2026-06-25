"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { getItemById, updateItem, deleteItem, recalculateItemWeight, Item } from "@/api/items";
import { getSalesByItemId, Sale } from "@/api/sales";
import SaleModal from "@/components/Admin/Inventory/Forms/Add-Sale";
import { formatItemDate } from "@/components/Admin/Inventory/inventory-utils";
import { ChevronDown, Download, NotebookPen, Trash2 } from "lucide-react";
import InfoTab from "./Info-Tab/Info-Tab";
import SalesTab from "./Sales-Tab/Sales-Tab";
import styles from "./View-Form.module.css";

type ActiveTab = "info" | "sales";

export default function ViewForm() {
  const [item, setItem] = useState<Item | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Item>>({});
  const [saving, setSaving] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusBeforeOnHold, setStatusBeforeOnHold] = useState("");
  const [actionsOpen, setActionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("info");
  const [toast, setToast] = useState<{ message: string; sub: string } | null>(null);

  const actionsRef = useRef<HTMLDivElement>(null);
  const { id: itemId } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await getItemById(itemId);
        setItem(data);
        setFormData(data);
        setImages(data.images ?? []);

        try {
          const { remainingWeight } = await recalculateItemWeight(itemId);
          setItem((prev) => (prev ? { ...prev, remainingWeight } : prev));
          setFormData((prev) => ({ ...prev, remainingWeight }));
        } catch {
          // Non-fatal: keep showing the last known remainingWeight if reconciliation fails.
        }
      } catch {
        setError("Failed to load item.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  const fetchSales = useCallback(async () => {
    try {
      setSalesLoading(true);
      const data = await getSalesByItemId(itemId);
      setSales(data);
    } catch {
      setSales([]);
    } finally {
      setSalesLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    if (!actionsOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setActionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionsOpen]);

  const showToast = (message: string, sub: string) => {
    setToast({ message, sub });
    setTimeout(() => setToast(null), 6000);
  };

  const handleDownloadLabel = () => {
    const rows = [
      ["SKU", "Breed", "Grade", "Farmer Name", "QR Code"],
      [
        formData.sku ?? "",
        formData.breed ?? "",
        formData.grade ?? "",
        formData.farmerName ?? "",
        formData.qrCode ?? "",
      ],
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "label.csv";
    link.click();
    URL.revokeObjectURL(url);
    setActionsOpen(false);
  };

  const handlePublish = async () => {
    try {
      if (formData?.isPublic == false) {
        await updateItem(itemId, { isPublic: true });
        setFormData((p) => ({ ...p, isPublic: true }));
        showToast(
          "Lot successfully published!",
          'Your changes have been saved and published externally. Change the status to "Processing" to hide this lot from the public inventory.',
        );
      } else {
        await updateItem(itemId, { isPublic: false });
        setFormData((p) => ({ ...p, isPublic: false }));
        showToast(
          "Lot unpublished.",
          "This lot is no longer visible in the public inventory.",
        );
      }
    } catch {
      setError("Failed to publish.");
    }
  };

  const handlePublishClick = () => {
    void handlePublish();
  };

  const handleStatusChange = (nextStatus: string) => {
    const currentStatus = formData.status ?? "";

    if (nextStatus === "On Hold" && currentStatus !== "On Hold") {
      setStatusBeforeOnHold(currentStatus);
      setFormData((p) => ({ ...p, status: "On Hold" }));
      setShowUnpublishModal(true);
      return;
    }

    setFormData((p) => ({ ...p, status: nextStatus }));
  };

  const handleCancelUnpublish = () => {
    setFormData((p) => ({ ...p, status: statusBeforeOnHold }));
    setShowUnpublishModal(false);
  };

  const handleConfirmUnpublish = async () => {
    try {
      setUnpublishing(true);
      await updateItem(itemId, { isPublic: false, status: "On Hold" });
      setFormData((p) => ({ ...p, isPublic: false, status: "On Hold" }));
      setShowUnpublishModal(false);
      showToast(
        "Lot unpublished.",
        "This lot is no longer visible in the public inventory.",
      );
    } catch {
      setFormData((p) => ({ ...p, status: statusBeforeOnHold }));
      setError("Failed to unpublish.");
    } finally {
      setUnpublishing(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateItem(itemId, {
        ...formData,
        images,
        coverImage: formData.coverImage ?? images[0] ?? "",
      });
      showToast(
        "Lot successfully updated!",
        'Your changes have been saved internally. Change the status to "In Stock" to make this lot available for sale.',
      );
    } catch {
      setError("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setActionsOpen(false);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteItem(itemId);
      router.push("/inventory");
    } catch {
      setError("Failed to delete.");
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-4 md:p-8">Loading...</div>;
  if (!item)
    return (
      <div className="p-4 md:p-8 text-red-600">{error ?? "Item not found"}</div>
    );

  const updatedLabel =
    formatItemDate(item.updatedAt) ?? formatItemDate(item.createdAt);

  const publishDisabled =
    !formData.isPublic && formData.status === "Processing";

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <Link href="/inventory" className={styles.backLink}>
          ← Back to Inventory
        </Link>
      </div>

      <div className={styles.headerTop}>
        <Link href="/inventory" className={styles.backLink}>
          ← Back to Inventory
        </Link>
        {updatedLabel && (
          <p className={styles.updatedAt}>Updated {updatedLabel}</p>
        )}
      </div>

      <div className={styles.titleRow}>
        <div className={styles.skuRow}>
          <h1 className={styles.skuTitle}>SKU: {formData.sku ?? ""}</h1>
          {formData.isPublic ? (
            <span className={styles.publishedBadge}>
              <span className={styles.publishedDot} />
              Published
            </span>
          ) : (
            <span className={styles.unpublishedBadge}>
              <span className={styles.unpublishedDot} />
              Unpublished
            </span>
          )}
        </div>

        <div className={styles.headerActions}>
          <div className={styles.actionsWrapper} ref={actionsRef}>
            <button
              type="button"
              onClick={() => setActionsOpen((open) => !open)}
              className={`${styles.btnSecondary} inline-flex items-center gap-1`}
            >
              Actions
              <ChevronDown size={16} />
            </button>
            {actionsOpen && (
              <div className={styles.actionsMenu}>
                <button
                  type="button"
                  onClick={() => {
                    setActionsOpen(false);
                    setShowSaleModal(true);
                  }}
                  className={styles.actionsMenuItem}
                >
                  <NotebookPen className={styles.actionsMenuIcon} />
                  Record a sale
                </button>
                <button
                  type="button"
                  onClick={handleDownloadLabel}
                  className={styles.actionsMenuItem}
                >
                  <Download className={styles.actionsMenuIcon} />
                  Download label
                </button>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className={`${styles.actionsMenuItem} ${styles.actionsMenuItemDanger}`}
                >
                  <Trash2 className={styles.actionsMenuIcon} />
                  Delete lot
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handlePublishClick}
            disabled={publishDisabled}
            className={styles.btnSecondary}
          >
            {formData.isPublic ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={styles.btnPrimary}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <h1 className={styles.skuMobile}>SKU: {formData.sku ?? itemId}</h1>

      <div className={styles.tabsWrapper}>
        <div className={styles.tabList}>
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={activeTab === "info" ? styles.tabActive : styles.tab}
          >
            Lot Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sales")}
            className={activeTab === "sales" ? styles.tabActive : styles.tab}
          >
            Sales History
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === "info" ? (
            <InfoTab
              itemId={itemId}
              item={item}
              formData={formData}
              setFormData={setFormData}
              images={images}
              setImages={setImages}
              saving={saving}
              onPublish={handlePublishClick}
              onSave={handleSave}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <SalesTab
              item={item}
              formData={formData}
              sales={sales}
              salesLoading={salesLoading}
            />
          )}
        </div>
      </div>

      {showUnpublishModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => !unpublishing && handleCancelUnpublish()}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="unpublish-modal-title"
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
            <h2 id="unpublish-modal-title" className={styles.modalTitle}>
              Unpublish this lot?
            </h2>
            <p className={styles.modalDescription}>
              Placing this lot on hold will remove this lot from the external
              inventory page.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={handleConfirmUnpublish}
                disabled={unpublishing}
                className={styles.modalConfirm}
              >
                {unpublishing ? "Unpublishing..." : "Unpublish Lot"}
              </button>
              <button
                type="button"
                onClick={handleCancelUnpublish}
                disabled={unpublishing}
                className={styles.modalCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
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
            <h2 id="delete-modal-title" className={styles.modalTitle}>
              Delete this lot?
            </h2>
            <p className={styles.modalDescription}>
              Deleting a lot is a permanent action that cannot be undone.
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
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className={styles.modalCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaleModal && (
        <SaleModal
          itemId={itemId}
          costPerWeight={formData.purchasePrice ?? 0}
          onClose={() => setShowSaleModal(false)}
          onSaleRecorded={() => {
            fetchSales();
            setActiveTab("sales");
          }}
        />
      )}

      {toast && (
        <div className={styles.toast}>
          <div className={styles.toastInner}>
            <div>
              <p className={styles.toastTitle}>{toast.message}</p>
              <p className={styles.toastSub}>{toast.sub}</p>
            </div>
            <button onClick={() => setToast(null)} className={styles.toastClose}>
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
