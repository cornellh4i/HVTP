"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getItemById, updateItem, deleteItem, Item } from "@/api/items";
import { getSalesByItemId, Sale } from "@/api/sales";
import SaleModal from "@/components/Admin/Inventory/Forms/Add-Sale";
import { Trash, Printer } from "lucide-react";
import InfoTab from "./Info-Tab/Info-Tab";

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

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setSalesLoading(true);
        const data = await getSalesByItemId(itemId);
        setSales(data);
      } catch {
        setSales([]);
      } finally {
        setSalesLoading(false);
      }
    };
    fetchSales();
  }, [itemId]);

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
          "Your changes have been saved and published externally. Change the status to “Processing” to hide this lot from the public inventory.",
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
        "Your changes have been saved internally. Change the status to “In Stock” to make this lot available for sale.",
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
    <main className="min-h-screen bg-white px-4 py-6 md:p-8">
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <Link
          href="/inventory"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Inventory
        </Link>
        <div className="hidden md:flex gap-2">
          <button
            onClick={handleGenerateLabel}
            className="hover:bg-gray-50 rounded p-1"
            aria-label="Print Label"
          >
            <Printer size={24} />
          </button>
          <button onClick={handleDelete}>
            <Trash size={24} />
          </button>
          <button
            onClick={() => setShowSaleModal(true)}
            className="rounded bg-[#D9D9D9] px-4 py-1.5 text-sm text-black hover:bg-blue-500"
          >
            Record a sale
          </button>
          <button
            onClick={handlePublish}
            className="rounded bg-[#D9D9D9] px-4 py-1.5 text-sm text-black hover:bg-blue-500"
          >
            {formData.isPublic ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-[#3A4F0D] px-4 py-1.5 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="mb-6 hidden md:block">
        <p className="text-base font-semibold text-gray-900">
          SKU: {formData.sku ?? ""}
        </p>
      </div>

      <h1 className="text-lg font-bold mb-4 md:hidden">
        SKU: {formData.sku ?? itemId}
      </h1>

      <InfoTab
        itemId={itemId}
        item={item}
        formData={formData}
        setFormData={setFormData}
        images={images}
        setImages={setImages}
        sales={sales}
        salesLoading={salesLoading}
        saving={saving}
        onPublish={handlePublish}
        onSave={handleSave}
      />

      {showSaleModal && (
        <SaleModal
          itemId={itemId}
          costPerWeight={formData.purchasePrice ?? 0}
          onClose={() => setShowSaleModal(false)}
          onSaleRecorded={(id, total) => console.log("Sold!", id, total)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{toast.message}</p>
              <p className="mt-1 text-sm text-gray-600">{toast.sub}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 mt-0.5 shrink-0">
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
