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
      } catch (err) {
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

      alert("Saved!");
    } catch {
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!item) return <div className="p-8">Item not found</div>;

  return (
    <main className="min-h-screen p-8 max-w-[1440px] mx-auto">

      {/* HEADER */}
      <div className="flex justify-between mb-8">
        <Link href="/inventory">← Back</Link>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <p className="text-gray-500 mb-6">SKU: {formData.sku}</p>

      <div className="grid grid-cols-2 gap-10">

        {/* LEFT */}
        <div className="flex flex-col gap-6">

          <Field label="Breed">
            <EditableField
              isEditing
              value={formData.breed ?? ""}
              onChange={set("breed")}
            />
          </Field>

          <Field label="Grade">
            <SelectField
              value={formData.grade ?? ""}
              onChange={set("grade")}
              options={GRADE_OPTIONS}
            />
          </Field>

          <Field label="Color">
            <SelectField
              value={formData.color ?? ""}
              onChange={set("color")}
              options={COLOR_OPTIONS}
            />
          </Field>

          <Field label="Weight">
            <EditableField
              isEditing
              value={String(formData.weight ?? "")}
              onChange={set("weight")}
            />
          </Field>

          <Field label="Status">
            <SelectField
              value={formData.status ?? ""}
              onChange={set("status")}
              options={STATUS_OPTIONS}
            />
          </Field>

        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          <ItemImageUpload
            sku={item.sku}
            existingImages={images}
            onImagesChange={setImages}
          />

          <Field label="Notes">
            <EditableField
              isEditing
              value={formData.notes ?? ""}
              multiline
              onChange={set("notes")}
            />
          </Field>
        </div>

      </div>
    </main>
  );
}