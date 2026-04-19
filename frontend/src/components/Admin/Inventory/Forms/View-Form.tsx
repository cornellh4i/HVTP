"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getItemById, updateItem, Item } from "@/api/items";
import EditableField from "@/components/ui/EditableField";
import SelectField, { SelectOption } from "@/components/ui/selectField";
import ItemImageUpload from "@/components/Admin/Inventory/Upload-Image/ItemImageUpload";

// OPTIONS

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
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
].map((s) => ({ label: s, value: s }));

// FIELD WRAPPER

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-gray-600">{label}</label>
      {children}
    </div>
  );
}

// MAIN COMPONENT

export default function ViewForm() {
  const [item, setItem] = useState<Item | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Item>>({});
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateItem(itemId, {
        ...formData,
        images,
        coverImage: images[0] ?? "",
      });
    } catch {
      setError("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!item) return <div className="p-8 text-red-600">{error ?? "Item not found"}</div>;

  return (
    <main className="min-h-screen bg-white p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/inventory"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Inventory
        </Link>
        <div className="flex gap-2">
          <button className="rounded border border-gray-300 px-4 py-1.5 text-sm hover:bg-gray-50">
            Print Label
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button className="rounded bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-700">
            Publish
          </button>
        </div>
      </div>

      {/* SKU */}
      <div className="mb-6">
        <p className="text-base font-semibold text-gray-900">SKU: {formData.sku ?? ""}</p>
      </div>
      
      <div className="grid grid-cols-[1fr_380px] gap-12 items-start">

        {/* LEFT */}
        <div className="flex flex-col gap-10">

          {/* General Information */}
          <section>
            <h2 className="text-2xl font-bold mb-5">General Information</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Breed">
                <EditableField isEditing value={formData.breed ?? ""} placeholder="Breed" onChange={set("breed")} />
              </Field>
              <Field label="Grade">
                <SelectField value={formData.grade ?? ""} onChange={set("grade")} options={GRADE_OPTIONS} placeholder="Grade" />
              </Field>
              <Field label="Color">
                <SelectField value={formData.color ?? ""} onChange={set("color")} options={COLOR_OPTIONS} placeholder="Color" />
              </Field>
              <Field label="Quantity (lb)">
                <EditableField isEditing value={String(formData.weight ?? "")} placeholder="Weight" onChange={set("weight")} />
              </Field>
              <Field label="Status">
                <SelectField value={formData.status ?? ""} onChange={set("status")} options={STATUS_OPTIONS} placeholder="Status" />
              </Field>
              <Field label="Type">
                <SelectField
                  value={(formData as any).type ?? ""}
                  onChange={(v) => setFormData((p) => ({ ...p, type: v }))}
                  options={TYPE_OPTIONS}
                  placeholder="Type"
                />
              </Field>
              <Field label="Pallet Location">
                <EditableField isEditing value={formData.palletLocation ?? ""} placeholder="Pallet Number" onChange={set("palletLocation")} />
              </Field>
            </div>
          </section>

          {/* Purchase Information */}
          <section>
            <h2 className="text-2xl font-bold mb-5">Purchase Information</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Farmer Name">
                <EditableField isEditing={false} value={formData.farmerName ?? ""} placeholder="Name" />
              </Field>
              <Field label="Shear Date">
                <EditableField isEditing value={formData.shearDate ?? ""} placeholder="MM/DD/YYYY" onChange={set("shearDate")} />
              </Field>
              <Field label="Farmer City">
                <EditableField isEditing={false} value={formData.farmerCity ?? ""} placeholder="City" />
              </Field>
              <Field label="Farmer State">
                <SelectField value={formData.farmerState ?? ""} onChange={() => {}} options={STATE_OPTIONS} placeholder="State" disabled />
              </Field>
              <Field label="Intake Price ($/lb)">
                <EditableField isEditing value={String(formData.purchasePrice ?? "")} placeholder="Price" onChange={set("purchasePrice")} />
              </Field>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          <ItemImageUpload sku={item.sku} existingImages={images} onImagesChange={setImages} />
          <Field label="Notes">
            <EditableField isEditing value={formData.notes ?? ""} placeholder="Notes" multiline onChange={set("notes")} />
          </Field>
        </div>
      </div>
    </main>
  );
}