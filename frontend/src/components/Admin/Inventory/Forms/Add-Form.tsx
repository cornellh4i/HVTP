"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addItem, Item } from "@/api/items";
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
  { label: "Available", value: "Available" },
  { label: "Out of Stock", value: "Out of Stock" },
];

const COLOR_OPTIONS: SelectOption[] = [
  { label: "White", value: "White" },
  { label: "Black", value: "Black" },
  { label: "Grey", value: "Grey" },
];

function Field({ label, children }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-gray-600">{label}</label>
      {children}
    </div>
  );
}

export default function AddForm() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    breed: "",
    grade: "",
    color: "",
    weight: "",
    palletLocation: "",
    status: STATUS_OPTIONS[0].value,
    shearDate: "",
    purchasePrice: "",
    notes: "",
  });

  const set = (field: keyof typeof formData) => (val: string) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  const handleAddLot = async () => {
    try {
      setLoading(true);

      const payload: Partial<Item> = {
        ...formData,
        weight: Number(formData.weight),
        purchasePrice: Number(formData.purchasePrice),
        images,
        coverImage: images[0] ?? "",
        name: formData.breed || "Unnamed Lot",
        isActive: true,
        isPublic: false,
      };

      const created = await addItem(payload);

      alert("Lot successfully added");

      router.push(`/inventory/${created.id}`);
    } catch (err) {
      console.error(err);
      alert("Error creating lot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-[1440px] mx-auto">

      <div className="flex justify-between mb-8">
        <Link href="/inventory">← Back to Inventory</Link>

        <button
          onClick={handleAddLot}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Adding..." : "Add Lot"}
        </button>
      </div>

      <p className="text-gray-500 mb-6">SKU: Auto-generated on save</p>

      <div className="grid grid-cols-2 gap-10">

        <div className="flex flex-col gap-6">

          <Field label="Breed">
            <EditableField isEditing value={formData.breed} onChange={set("breed")} />
          </Field>

          <Field label="Grade">
            <SelectField value={formData.grade} onChange={set("grade")} options={GRADE_OPTIONS} />
          </Field>

          <Field label="Color">
            <SelectField value={formData.color} onChange={set("color")} options={COLOR_OPTIONS} />
          </Field>

          <Field label="Weight">
            <EditableField isEditing value={formData.weight} onChange={set("weight")} />
          </Field>

          <Field label="Status">
            <SelectField value={formData.status} onChange={set("status")} options={STATUS_OPTIONS} />
          </Field>

        </div>

        <div>
          <ItemImageUpload sku="" existingImages={images} onImagesChange={setImages} />
        </div>

      </div>
    </main>
  );
}