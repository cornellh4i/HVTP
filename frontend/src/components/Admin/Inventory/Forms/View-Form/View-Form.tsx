"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { getItemById, updateItem, deleteItem, Item } from "@/api/items";
import { getSalesByItemId, Sale } from "@/api/sales";
import SaleModal from "@/components/Admin/Inventory/Forms/Add-Sale";
import { Trash, Printer } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<ActiveTab>("info");
  const [toast, setToast] = useState<{ message: string; sub: string } | null>(null);

  const { id: itemId } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await getItemById(itemId);
        setItem(data);
        setFormData(data);
        setImages(data.images ?? []);
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

  const showToast = (message: string, sub: string) => {
    setToast({ message, sub });
    setTimeout(() => setToast(null), 6000);
  };

  const handleGenerateLabel = () => {
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
    link.download = `label-${formData.sku ?? itemId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateItem(itemId, {
        ...formData,
        images,
        coverImage: images[0] ?? "",
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

  const handleDelete = async () => {
    if (
      !confirm("Unpublish this lot? Placing this lot on hold will remove this lot from the external inventory page.")
    ) {
      return;
    }
    try {
      await deleteItem(itemId);
      router.push("/inventory");
    } catch {
      setError("Failed to delete.");
    }
  };

  if (loading) return <div className="p-4 md:p-8">Loading...</div>;
  if (!item)
    return (
      <div className="p-4 md:p-8 text-red-600">{error ?? "Item not found"}</div>
    );

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <Link href="/inventory" className={styles.backLink}>
          ← Back to Inventory
        </Link>
        <div className={styles.headerActions}>
          <button
            onClick={handleGenerateLabel}
            className={styles.iconBtn}
            aria-label="Print Label"
          >
            <Printer size={24} />
          </button>
          <button onClick={handleDelete} className={styles.iconBtn}>
            <Trash size={24} />
          </button>
          <button
            onClick={() => setShowSaleModal(true)}
            className={styles.btnSecondary}
          >
            Record a sale
          </button>
          <button onClick={handlePublish} className={styles.btnSecondary}>
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

      <div className={styles.skuDesktop}>
        <p className={styles.skuText}>SKU: {formData.sku ?? ""}</p>
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
              onPublish={handlePublish}
              onSave={handleSave}
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
