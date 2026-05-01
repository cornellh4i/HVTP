"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getItemById, updateItem, Item } from "@/api/items";
import EditableField from "@/components/ui/EditableField";
import SelectField, { SelectOption } from "@/components/ui/selectField";
import ItemImageUpload from "@/components/Admin/Inventory/Upload-Image/ItemImageUpload";
import SetCoverPhotoModal from "@/components/Admin/Inventory/SetCoverPhotoModal";
import SaleModal from "@/components/Admin/Inventory/Forms/Add-Sale";

const GRADE_OPTIONS: SelectOption[] = [
  { label: "Fine", value: "Fine" },
  { label: "Medium", value: "Medium" },
  { label: "Long", value: "Long" },
  { label: "Rug", value: "Rug" },
  { label: "Alpaca", value: "Alpaca" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Processing", value: "Processing" },
  { label: "On Hold", value: "On Hold" },
  { label: "Available", value: "Available" },
  { label: "Out of Stock", value: "Out of Stock" },
];

const TYPE_OPTIONS: SelectOption[] = [
  { label: "Grease Wool", value: "Grease Wool" },
  { label: "Scoured Wool", value: "Scoured Wool" },
  { label: "Carded Wool", value: "Carded Wool" },
];

const COLOR_OPTIONS: SelectOption[] = [
  { label: "White", value: "White" },
  { label: "Natural Color", value: "Natural Color" },
  { label: "Black", value: "Black" },
  { label: "Grey", value: "Grey" },
  { label: "Brown", value: "Brown" },
];

const STATE_OPTIONS: SelectOption[] = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
].map((s) => ({ label: s, value: s }));

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full [&_input]:h-[44px] [&_input]:rounded-lg [&_input]:border [&_input]:border-gray-300 [&_input]:px-4 [&_input]:py-3 [&_select]:h-[44px] [&_select]:rounded-lg [&_select]:border [&_select]:border-gray-300 [&_select]:px-4 [&_select]:py-3">
      <label className="text-sm text-gray-600">{label}</label>
      {children}
    </div>
  );
}

export default function ViewForm() {
  const [item, setItem] = useState<Item | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Item>>({});
  const [saving, setSaving] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; sub: string } | null>(
    null,
  );

  const { id: itemId } = useParams<{ id: string }>();

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

  const set = (field: keyof Item) => (val: string) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  const showToast = (message: string, sub: string) => {
    setToast({ message, sub });
    setTimeout(() => setToast(null), 6000);
  };

  const handlePublish = async () => {
    try {
      if (formData?.isPublic == false) {
        await updateItem(itemId, { isPublic: true });
        setFormData((p) => ({ ...p, isPublic: true }));
        showToast(
          "Lot successfully published!",
          "Your changes have been saved and published externally. Change the status to \u201cProcessing\u201d to hide this lot from the public inventory.",
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
        "Your changes have been saved internally. Change the status to \u201cIn Stock\u201d to make this lot available for sale.",
      );
    } catch {
      setError("Failed to save.");
    } finally {
      setSaving(false);
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
          <button className="rounded border border-gray-300 px-4 py-1.5 text-sm hover:bg-gray-50">
            Print Label
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

      <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-6 md:gap-12">
        <div className="flex flex-col gap-6 md:gap-10">
          <div className="md:hidden">
            <p className="text-sm font-semibold text-gray-900 mb-2">Photos</p>
            <ItemImageUpload
              sku={item.sku}
              existingImages={images}
              onImagesChange={setImages}
              hidePreview
            />
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCoverModal(true)}
                className="mt-3 inline-flex items-center gap-2 rounded border px-4 py-2 text-sm hover:bg-gray-50 w-fit"
              >
                Set cover photo
              </button>
            )}
          </div>

          <section>
            <h2 className="text-lg font-bold mb-4 md:text-2xl md:mb-5">
              General Information
            </h2>
            <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-5">
              <Field label="Breed">
                <EditableField
                  isEditing
                  value={formData.breed ?? ""}
                  placeholder="Breed"
                  onChange={set("breed")}
                />
              </Field>
              <Field label="Grade">
                <SelectField
                  value={formData.grade ?? ""}
                  onChange={set("grade")}
                  options={GRADE_OPTIONS}
                  placeholder="Grade"
                />
              </Field>
              <Field label="Color">
                <SelectField
                  value={formData.color ?? ""}
                  onChange={set("color")}
                  options={COLOR_OPTIONS}
                  placeholder="Color"
                />
              </Field>
              <Field label="Quantity (lb)">
                <EditableField
                  isEditing
                  value={String(formData.weight ?? "")}
                  placeholder="Weight"
                  onChange={set("weight")}
                />
              </Field>
              <Field label="Pallet Location">
                <EditableField
                  isEditing
                  value={formData.palletLocation ?? ""}
                  placeholder="Pallet Number"
                  onChange={set("palletLocation")}
                />
              </Field>
              <Field label="Status">
                <SelectField
                  value={formData.status ?? ""}
                  onChange={set("status")}
                  options={STATUS_OPTIONS}
                  placeholder="Status"
                />
              </Field>
              <Field label="Type">
                <SelectField
                  value={(formData as any).type ?? ""}
                  onChange={(v) => setFormData((p) => ({ ...p, type: v }))}
                  options={TYPE_OPTIONS}
                  placeholder="Type"
                />
              </Field>
            </div>
          </section>

          <div className="md:hidden">
            <Field label="Notes">
              <EditableField
                isEditing
                value={formData.notes ?? ""}
                placeholder="Notes"
                multiline
                onChange={set("notes")}
              />
            </Field>
          </div>

          <section>
            <h2 className="text-lg font-bold mb-4 md:text-2xl md:mb-5">
              Purchase Information
            </h2>
            <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-5">
              <Field label="Farmer Name">
                <EditableField
                  isEditing
                  value={formData.farmerName ?? ""}
                  placeholder="Name"
                  onChange={set("farmerName")}
                />
              </Field>
              <Field label="Farmer City">
                <EditableField
                  isEditing
                  value={formData.farmerCity ?? ""}
                  placeholder="City"
                  onChange={set("farmerCity")}
                />
              </Field>
              <Field label="Farmer State">
                <SelectField
                  value={formData.farmerState ?? ""}
                  onChange={set("farmerState")}
                  options={STATE_OPTIONS}
                  placeholder="State"
                />
              </Field>
              <Field label="Shear Date">
                <EditableField
                  isEditing
                  value={formData.shearDate ?? ""}
                  placeholder="MM/DD/YYYY"
                  onChange={set("shearDate")}
                />
              </Field>
              <Field label="Purchase Price ($/lb)">
                <EditableField
                  isEditing
                  value={String(formData.purchasePrice ?? "")}
                  placeholder="Price"
                  onChange={set("purchasePrice")}
                />
              </Field>
            </div>
          </section>

          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={handlePublish}
                className="w-full rounded-lg bg-[#9F9E97] px-4 py-3 text-sm text-white hover:bg-[#8a897e]"
              >
                {formData.isPublic ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-lg bg-[#2C2C2C] px-4 py-3 text-sm text-white hover:bg-[#1A1A1A] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-4">
          <ItemImageUpload
            sku={item.sku}
            existingImages={images}
            onImagesChange={setImages}
          />

          {images.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCoverModal(true)}
              className="inline-flex items-center gap-2 rounded border px-4 py-2 text-sm hover:bg-gray-50 w-fit"
            >
              Set cover photo
            </button>
          )}

          <Field label="Notes">
            <EditableField
              isEditing
              value={formData.notes ?? ""}
              placeholder="Notes"
              multiline
              onChange={set("notes")}
            />
          </Field>
        </div>
      </div>

      {showCoverModal && (
        <SetCoverPhotoModal
          itemId={itemId}
          images={images}
          currentCover={formData.coverImage ?? images[0] ?? ""}
          onClose={() => setShowCoverModal(false)}
          onSave={(newCover) =>
            setFormData((p) => ({ ...p, coverImage: newCover }))
          }
        />
      )}
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
              <p className="font-semibold text-gray-900 text-sm">
                {toast.message}
              </p>
              <p className="mt-1 text-sm text-gray-600">{toast.sub}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-600 mt-0.5 shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}