"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { getItemById, updateItem, Item } from "@/api/items";
import EditableField from "@/components/ui/EditableField";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-gray-600">{label}</label>
      {children}
    </div>
  );
}

function ImageSlot({ src, iconClass }: { src?: string; iconClass?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <ImageIcon className={iconClass ?? "w-16 h-16 text-gray-300"} />;
  }

  return (
    <img
      src={src}
      alt=""
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function ViewForm() {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Item>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const { id: itemId } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getItemById(itemId);
        setItem(data);
        setFormData(data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  const handleSave = async () => {
    try {
      setSaveStatus("saving");
      await updateItem(itemId, formData);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const set = (field: keyof Item) => (val: string) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  const BackLink = () => (
    <Link
      href="/inventory"
      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
    >
      ← Back to Inventory
    </Link>
  );

  if (loading)
    return (
      <main className="min-h-screen p-8 max-w-5xl mx-auto">
        <div className="mb-8"><BackLink /></div>
        <h1 className="text-4xl font-bold">Loading...</h1>
      </main>
    );

  if (error)
    return (
      <main className="min-h-screen p-8 max-w-5xl mx-auto">
        <div className="mb-8"><BackLink /></div>
        <h1 className="text-4xl font-bold text-red-600">{error}</h1>
      </main>
    );

  if (!item)
    return (
      <main className="min-h-screen p-8 max-w-5xl mx-auto">
        <div className="mb-8"><BackLink /></div>
        <h1 className="text-4xl font-bold">Item not found</h1>
      </main>
    );

  const images: string[] = formData.images ?? [];

  return (
    <main className="min-h-screen p-8 max-w-[1440px] mx-auto pr-[86px]">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <BackLink />
        <div className="flex gap-2">
          <button className="rounded border px-4 py-1.5 text-sm hover:bg-gray-50">
            Print Label
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "saved"
              ? "Saved!"
              : saveStatus === "error"
              ? "Error"
              : "Save Changes"}
          </button>
          <button className="rounded bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-700">
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[713px_1fr] gap-[126px]">

        {/*LEFT*/}
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="text-xl font-bold mb-1">General Information</h2>
            <p className="text-sm text-gray-500 mb-5">SKU: {formData.sku ?? ""}</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Breed">
                <EditableField isEditing={true} value={formData.breed ?? ""} placeholder="Breed" onChange={set("breed")} />
              </Field>
              <Field label="Grade">
                <EditableField isEditing={true} value={formData.grade ?? ""} placeholder="Grade" onChange={set("grade")} />
              </Field>
              <Field label="Color">
                <EditableField isEditing={true} value={formData.color ?? ""} placeholder="Color" onChange={set("color")} />
              </Field>
              <Field label="Weight (lb)">
                <EditableField isEditing={true} value={String(formData.weight ?? "")} placeholder="Weight" onChange={set("weight")} />
              </Field>
              <Field label="Pallet Location">
                <EditableField isEditing={true} value={formData.palletNumber ?? ""} placeholder="Pallet Number" onChange={set("palletNumber")} />
              </Field>
              <Field label="Status">
                <EditableField isEditing={true} value={formData.status ?? ""} placeholder="Status" onChange={set("status")} />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-5">Purchase Information</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Farmer Name">
                <EditableField isEditing={true} value={formData.farmerName ?? ""} placeholder="Name" onChange={set("farmerName")} />
              </Field>
              <Field label="Shear Date">
                <EditableField isEditing={true} value={formData.shearDate ?? ""} placeholder="MM/DD/YYYY" onChange={set("shearDate")} />
              </Field>
              <Field label="Farmer City">
                <EditableField isEditing={true} value={formData.farmerCity ?? ""} placeholder="City" onChange={set("farmerCity")} />
              </Field>
              <Field label="Farmer State">
                <EditableField isEditing={true} value={formData.farmerState ?? ""} placeholder="State" onChange={set("farmerState")} />
              </Field>
              <Field label="Purchase Price ($/lb)">
                <EditableField isEditing={true} value={String(formData.purchasePrice ?? "")} placeholder="Price" onChange={set("purchasePrice")} />
              </Field>
            </div>
          </section>
        </div>

        {/*RIGHT*/}
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-square rounded-lg border border-gray-200 flex items-center justify-center bg-white overflow-hidden">
            <ImageSlot src={images[0]} iconClass="w-16 h-16 text-gray-300" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="aspect-square rounded-md border border-gray-200 flex items-center justify-center bg-white overflow-hidden"
              >
                <ImageSlot src={images[idx]} iconClass="w-6 h-6 text-gray-300" />
              </div>
            ))}
          </div>

          <Field label="Notes">
            <EditableField
              isEditing={true}
              value={formData.notes ?? ""}
              placeholder="Notes"
              multiline
              onChange={set("notes")}
            />
          </Field>
        </div>

      </div>
    </main>
  );
}