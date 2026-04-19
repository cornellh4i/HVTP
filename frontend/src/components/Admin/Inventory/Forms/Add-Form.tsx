"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, ChangeEvent } from "react";
import { addItem, Item } from "@/api/items";
import { addFarmer } from "@/api/farmers";
import { uploadItemImage } from "@/lib/uploadImage";
import EditableField from "@/components/ui/EditableField";
import SelectField, { SelectOption } from "@/components/ui/selectField";
import { Upload } from "lucide-react";

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

type ItemFields = {
  breed: string;
  grade: string;
  color: string;
  weight: string;
  palletLocation: string;
  status: string;
  type: string;
  shearDate: string;
  purchasePrice: string;
  notes: string;
};

type FarmerFormFields = {
  name: string;
  contact: string;
  city: string;
  state: string;
};

// MAIN COMPONENT

export default function AddForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [itemFields, setItemFields] = useState<ItemFields>({
    breed: "",
    grade: "",
    color: "",
    weight: "",
    palletLocation: "",
    status: "Processing",
    type: "",
    shearDate: "",
    purchasePrice: "",
    notes: "",
  });

  const [farmerFormFields, setFarmerFormFields] = useState<FarmerFormFields>({
    name: "",
    contact: "",
    city: "",
    state: "",
  });

  const setItem = (field: keyof ItemFields) => (val: string) =>
    setItemFields((prev) => ({ ...prev, [field]: val }));

  const setFarmerField = (field: keyof FarmerFormFields) => (val: string) =>
    setFarmerFormFields((prev) => ({ ...prev, [field]: val }));
  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 3 - images.length;
    const selected = files.slice(0, remaining);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of selected) {
        const url = await uploadItemImage(file, "temp", images.length + uploaded.length);
        uploaded.push(url);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const handleAddLot = async () => {
    try {
      setLoading(true);
      const farmer = await addFarmer(farmerFormFields);
      const payload: Partial<Item> & Record<string, unknown> = {
        ...itemFields,
        weight: itemFields.weight ? parseFloat(itemFields.weight) : undefined,
        purchasePrice: itemFields.purchasePrice ? parseFloat(itemFields.purchasePrice) : undefined,
        images,
        coverImage: images[0] ?? "",
        name: itemFields.breed || "Unnamed Lot",
        farmerId: farmer.id,
        isActive: true,
        isPublic: false,
        createdAt: new Date().toISOString(),
      };

      const created = await addItem(payload);
      router.push(`/inventory/${created.id}`);
    } catch (err) {
      console.error(err);
      alert("Error creating lot");
    } finally {
      setLoading(false);
    }
  };

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
        <button
          onClick={handleAddLot}
          disabled={loading}
          className="rounded bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Lot"}
        </button>
      </div>

      {/* SKU */}
      <div className="mb-6">
        <p className="text-base font-semibold text-gray-900">SKU: ##-#-#-####-###</p>
        <p className="text-xs text-gray-400">(Automatically generated)</p>
      </div>
      <div className="grid grid-cols-[1fr_380px] gap-12 items-start">

        {/* LEFT */}
        <div className="flex flex-col gap-10">

          <section>
            <h2 className="text-2xl font-bold mb-5">General Information</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Breed">
                <EditableField isEditing value={itemFields.breed} placeholder="Breed" onChange={setItem("breed")} />
              </Field>
              <Field label="Grade">
                <SelectField value={itemFields.grade} onChange={setItem("grade")} options={GRADE_OPTIONS} placeholder="Grade" />
              </Field>
              <Field label="Color">
                <SelectField value={itemFields.color} onChange={setItem("color")} options={COLOR_OPTIONS} placeholder="Color" />
              </Field>
              <Field label="Quantity (lb)">
                <EditableField isEditing value={itemFields.weight} placeholder="Weight" onChange={setItem("weight")} />
              </Field>
              <Field label="Status">
                <SelectField value={itemFields.status} onChange={setItem("status")} options={STATUS_OPTIONS} placeholder="Status" />
              </Field>
              <Field label="Type">
                <SelectField value={itemFields.type} onChange={setItem("type")} options={TYPE_OPTIONS} placeholder="Type" />
              </Field>
              <Field label="Pallet Location">
                <EditableField isEditing value={itemFields.palletLocation} placeholder="Pallet Number" onChange={setItem("palletLocation")} />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-5">Purchase Information</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Farmer Name">
                <EditableField isEditing value={farmerFormFields.name} placeholder="Name" onChange={setFarmerField("name")} />
              </Field>
              <Field label="Shear Date">
                <EditableField isEditing value={itemFields.shearDate} placeholder="MM/DD/YYYY" onChange={setItem("shearDate")} />
              </Field>
              <Field label="Farmer City">
                <EditableField isEditing value={farmerFormFields.city} placeholder="City" onChange={setFarmerField("city")} />
              </Field>
              <Field label="Farmer State">
                <SelectField value={farmerFormFields.state} onChange={setFarmerField("state")} options={STATE_OPTIONS} placeholder="State" />
              </Field>
              <Field label="Intake Price ($/lb)">
                <EditableField isEditing value={itemFields.purchasePrice} placeholder="Price" onChange={setItem("purchasePrice")} />
              </Field>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading || images.length >= 3}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading || images.length >= 3}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload photos"}
            </button>
            {images.length > 0 && (
              <p className="mt-1.5 text-xs text-gray-400">{images.length} photo{images.length > 1 ? "s" : ""} selected</p>
            )}
          </div>

          <Field label="Notes">
            <EditableField isEditing value={itemFields.notes} placeholder="Notes" multiline onChange={setItem("notes")} />
          </Field>
        </div>
      </div>
    </main>
  );
}