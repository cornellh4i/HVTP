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
import { Card } from "@/components/ui/card";
import styles from "./Add-Form.module.css";

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
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
    const missing: string[] = [];
    if (!itemFields.breed) missing.push("Breed");
    if (!itemFields.grade) missing.push("Grade");
    if (!itemFields.color) missing.push("Color");
    if (itemFields.weight === "") missing.push("Weight");
    if (itemFields.palletLocation === "") missing.push("Pallet Location");
    if (!itemFields.status) missing.push("Status");
    if (!itemFields.type) missing.push("Type");
    if (!itemFields.shearDate) missing.push("Shear Date");
    if (!farmerFormFields.name) missing.push("Farmer Name");
    if (!farmerFormFields.city) missing.push("Farmer City");
    if (!farmerFormFields.state) missing.push("Farmer State");
    if (missing.length > 0) {
      alert(`Please fill in the following required fields:\n• ${missing.join("\n• ")}`);
      return;
    }

    try {
      setLoading(true);
      const farmer = await addFarmer(farmerFormFields);
      const payload: Partial<Item> & Record<string, unknown> = {
        ...itemFields,
        weight: itemFields.weight ? parseFloat(itemFields.weight) : undefined,
        purchasePrice: itemFields.purchasePrice !== "" ? parseFloat(itemFields.purchasePrice) : undefined,
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
      alert(`Error creating lot: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <Link href="/inventory" className={styles.backLink}>
          ← Back to Inventory
        </Link>
        <button
          onClick={handleAddLot}
          disabled={loading}
          className={styles.btnAddLot}
        >
          {loading ? "Adding..." : "Add Lot"}
        </button>
      </div>

      <div className={styles.skuDesktop}>
        <p className={styles.skuText}>SKU: ##-#-#-####-###</p>
        <p className={styles.skuSub}>(Automatically generated)</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.leftCol}>
          <div className={styles.mobileUpload}>
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
                className={styles.uploadBtnFull}
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload photos"}
              </button>
            ) : (
              <div>
                <p className={styles.photosLabel}>Photos</p>
                <div className={styles.photoRow}>
                  {images.map((img, i) => (
                    <div key={i} className={styles.photoThumb}>
                      <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover rounded-md" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className={styles.removeBtn}
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
                      className={styles.addPhotoBtn}
                    >
                      <Plus className="h-5 w-5 text-gray-400" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowCoverPicker(true)}
                  className={styles.setCoverBtn}
                >
                  Set cover photo
                </button>
              </div>
            )}
          </div>

          <section>
            <Card className="p-6">
              <h2 className={styles.sectionTitle}>Lot Information</h2>
              <div className={styles.fieldGrid}>
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
            </Card>
          </section>

          <div className="md:hidden">
            <Field label="Notes">
              <EditableField isEditing value={itemFields.notes} placeholder="Notes" multiline onChange={setItem("notes")} />
            </Field>
          </div>

          <section>
            <Card className="p-6">
              <h2 className={styles.sectionTitle}>Purchase Information</h2>
              <div className={styles.fieldGrid}>
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
                    className={styles.dateInput}
                    value={itemFields.shearDate}
                    onChange={(e) => setItem("shearDate")(e.target.value)}
                  />
                </Field>
                <Field label="Purchase Price ($/lb)">
                  <EditableField isEditing value={itemFields.purchasePrice} placeholder="Price" onChange={setItem("purchasePrice")} />
                </Field>
              </div>
            </Card>
          </section>

          <div className={styles.mobileBtns}>
            <div className={styles.mobileBtnGroup}>
              <button
                onClick={handleAddLot}
                disabled={loading}
                className={styles.btnPublish}
              >
                {loading ? "Publishing..." : "Publish"}
              </button>
              <button
                onClick={handleAddLot}
                disabled={loading}
                className={styles.btnSave}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
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
              className={styles.uploadBtnDesktop}
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload photos"}
            </button>
            {images.length > 0 && (
              <p className={styles.photoCount}>
                {images.length} photo{images.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <Field label="Notes">
            <EditableField isEditing value={itemFields.notes} placeholder="Notes" multiline onChange={setItem("notes")} />
          </Field>
        </div>
      </div>

      {showCoverPicker && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalInner}>
            <button
              onClick={() => setShowCoverPicker(false)}
              className={styles.modalClose}
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className={styles.modalTitle}>Set cover photo</h2>

            <div className={styles.coverGrid}>
              {images.map((url, idx) => {
                const isSelected = url === coverImage;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverImage(url)}
                    className={isSelected ? styles.coverOptionActive : styles.coverOption}
                  >
                    <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                    <span className={isSelected ? styles.coverRadioActive : styles.coverRadio}>
                      {isSelected && <span className={styles.coverRadioDot} />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowCoverPicker(false)}
                className={styles.btnSaveModal}
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
