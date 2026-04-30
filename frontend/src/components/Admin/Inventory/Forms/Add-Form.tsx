"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, ChangeEvent } from "react";
import { addItem, Item } from "@/api/items";
import { addFarmer } from "@/api/farmers";
import { uploadItemImage } from "@/lib/uploadImage";
import EditableField from "@/components/ui/EditableField";
import SelectField, { SelectOption } from "@/components/ui/selectField";
import { Upload, X, Plus } from "lucide-react";
import Image from "next/image";

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

function Field({ label, children, fullWidth = false }: { label: string; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : "w-[75%] md:w-full"} [&_input]:h-[44px] [&_input]:rounded-lg [&_input]:border [&_input]:border-gray-300 [&_input]:px-4 [&_input]:py-3 [&_select]:h-[44px] [&_select]:rounded-lg [&_select]:border [&_select]:border-gray-300 [&_select]:px-4 [&_select]:py-3`}>
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
  city: string;
  state: string;
};

export default function AddForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<string>("");
  const [showCoverPicker, setShowCoverPicker] = useState(false);

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
      setImages((prev) => {
        const newImages = [...prev, ...uploaded];
        if (!coverImage && newImages.length > 0) {
          setCoverImage(newImages[0]);
        }
        return newImages;
      });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      if (coverImage === prev[index]) {
        setCoverImage(newImages[0] ?? "");
      }
      return newImages;
    });
  };

  const handleAddLot = async () => {
    try {
      setLoading(true);
      const farmer = await addFarmer(farmerFormFields);
      const payload: Partial<Item> & Record<string, unknown> = {
        ...itemFields,
        weight: itemFields.weight ? parseFloat(itemFields.weight) : undefined,
        purchasePrice: itemFields.purchasePrice ? parseFloat(itemFields.purchasePrice) : undefined,
        images,
        coverImage: coverImage || images[0] || "",
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
    <main className="min-h-screen bg-white px-4 py-6 md:p-8">
      <div className="flex items-center justify-between mb-6 md:mb-6">
        <Link
          href="/inventory"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Inventory
        </Link>
        <button
          onClick={handleAddLot}
          disabled={loading}
          className="hidden md:block rounded bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Lot"}
        </button>
      </div>

      <div className="mb-6 hidden md:block">
        <p className="text-base font-semibold text-gray-900">SKU: ##-#-#-####-###</p>
        <p className="text-xs text-gray-400">(Automatically generated)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-6 md:gap-12 items-start">
        <div className="flex flex-col gap-6 md:gap-10">
          <section>
            <h2 className="text-lg font-bold mb-4 md:text-2xl md:mb-5">General Information</h2>
            <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-5">
              <Field label="Breed">
                <EditableField isEditing value={itemFields.breed} placeholder="Breed" onChange={setItem("breed")} />
              </Field>
              <Field label="Grade">
                <SelectField value={itemFields.grade} onChange={setItem("grade")} options={GRADE_OPTIONS} placeholder="Grade" />
              </Field>
              <Field label="Color">
                <SelectField value={itemFields.color} onChange={setItem("color")} options={COLOR_OPTIONS} placeholder="Color" />
              </Field>
              <Field label="Weight (lb)">
                <EditableField isEditing value={itemFields.weight} placeholder="Weight (lb)" onChange={setItem("weight")} />
              </Field>
              <Field label="Pallet Location">
                <EditableField isEditing value={itemFields.palletLocation} placeholder="Pallet Number" onChange={setItem("palletLocation")} />
              </Field>
              <Field label="Status">
                <SelectField value={itemFields.status} onChange={setItem("status")} options={STATUS_OPTIONS} placeholder="Status" />
              </Field>
              <Field label="Type">
                <SelectField value={itemFields.type} onChange={setItem("type")} options={TYPE_OPTIONS} placeholder="Type" />
              </Field>
            </div>
          </section>

          <div className="md:hidden">
            <Field label="Notes" fullWidth>
              <EditableField isEditing value={itemFields.notes} placeholder="Notes" multiline onChange={setItem("notes")} />
            </Field>
          </div>

          <section>
            <h2 className="text-lg font-bold mb-4 md:text-2xl md:mb-5">Purchase Information</h2>
            <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-5">
              <Field label="Farmer Name">
                <EditableField isEditing value={farmerFormFields.name} placeholder="Name" onChange={setFarmerField("name")} />
              </Field>
              <Field label="Farmer City">
                <EditableField isEditing value={farmerFormFields.city} placeholder="City" onChange={setFarmerField("city")} />
              </Field>
              <Field label="Farmer State">
                <SelectField value={farmerFormFields.state} onChange={setFarmerField("state")} options={STATE_OPTIONS} placeholder="State" />
              </Field>
              <Field label="Shear Date">
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm h-[44px]"
                  value={itemFields.shearDate}
                  onChange={(e) => setItem("shearDate")(e.target.value)}
                />
              </Field>
              <Field label="Purchase Price ($/lb)">
                <EditableField isEditing value={itemFields.purchasePrice} placeholder="Price" onChange={setItem("purchasePrice")} />
              </Field>
            </div>
          </section>

          <div className="md:hidden pb-4">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading || images.length >= 3}
              onChange={handleFileChange}
              className="hidden"
            />

            {images.length === 0 ? (
              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#646D72] px-4 py-3 text-sm text-white hover:bg-[#545c60] disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload photos"}
              </button>
            ) : (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">Photos</p>
                <div className="flex items-center gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16">
                      <Image
                        src={img}
                        alt={`Photo ${i + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 bg-gray-600 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => inputRef.current?.click()}
                      className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50"
                    >
                      <Plus className="h-5 w-5 text-gray-400" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowCoverPicker(true)}
                  className="mt-3 inline-flex items-center gap-2 rounded border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Set cover photo
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-8">
              <button
                onClick={handleAddLot}
                disabled={loading}
                className="w-full rounded-lg bg-[#9F9E97] px-4 py-3 text-sm text-white hover:bg-[#8a897e] disabled:opacity-50"
              >
                {loading ? "Publishing..." : "Publish"}
              </button>
              <button
                onClick={handleAddLot}
                disabled={loading}
                className="w-full rounded-lg bg-[#2C2C2C] px-4 py-3 text-sm text-white hover:bg-[#1A1A1A] disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-4">
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

          <Field label="Notes" fullWidth>
            <EditableField isEditing value={itemFields.notes} placeholder="Notes" multiline onChange={setItem("notes")} />
          </Field>
        </div>
      </div>

      {showCoverPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-[90%] max-w-[520px] max-h-[90vh] overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <button
              onClick={() => setShowCoverPicker(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="mb-5 text-base font-semibold text-gray-900">
              Set cover photo
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {images.map((url, idx) => {
                const isSelected = url === coverImage;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverImage(url)}
                    className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-colors ${
                      isSelected
                        ? "border-blue-600"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <span
                      className={`absolute left-2 top-2 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-white ${
                        isSelected ? "border-blue-600" : "border-gray-400"
                      }`}
                    >
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowCoverPicker(false)}
                className="rounded bg-gray-900 px-5 py-2 text-sm text-white hover:bg-gray-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}