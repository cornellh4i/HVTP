"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, ChangeEvent, useMemo } from "react";
import Image from "next/image";
import { addItem, Item } from "@/api/items";
import { addFarmer } from "@/api/farmers";
import { uploadItemImage } from "@/lib/uploadImage";
import EditableField from "@/components/ui/EditableField";
import SelectField, { SelectOption } from "@/components/ui/selectField";
import { Card } from "@/components/ui/card";
import { ImageIcon, Upload, X } from "lucide-react";
import styles from "./Add-Form.module.css";

const GRADE_OPTIONS: SelectOption[] = [
  { label: "Fine", value: "Fine" },
  { label: "Medium", value: "Medium" },
  { label: "Long", value: "Long" },
  { label: "Rug", value: "Rug" },
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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
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
  suitableFor: string;
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<string>("");
  const [farmName, setFarmName] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [itemFields, setItemFields] = useState<ItemFields>({
    breed: "",
    grade: "",
    color: "",
    weight: "",
    palletLocation: "",
    status: "",
    type: "",
    shearDate: "",
    purchasePrice: "",
    notes: "",
    suitableFor: "",
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

  const isFormValid = useMemo(() => {
    return Boolean(
      itemFields.breed.trim() &&
        itemFields.grade &&
        itemFields.color &&
        itemFields.weight.trim() &&
        itemFields.status &&
        itemFields.type &&
        itemFields.shearDate &&
        itemFields.purchasePrice.trim() &&
        farmerFormFields.name.trim() &&
        farmerFormFields.state,
    );
  }, [itemFields, farmerFormFields]);

  const previewImage = images[activeImageIndex] ?? images[0] ?? null;

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 3 - images.length;
    const selected = files.slice(0, remaining);

    setUploading(true);
    setUploadError(null);

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
      setActiveImageIndex(images.length);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
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
    setActiveImageIndex((prev) => Math.max(0, prev - 1));
  };

  const triggerUpload = () => {
    if (images.length < 3) {
      inputRef.current?.click();
    }
  };

  const handleAddLot = async () => {
    if (!isFormValid) return;

    try {
      setLoading(true);
      const farmer = await addFarmer(farmerFormFields);
      const payload: Partial<Item> & Record<string, unknown> = {
        ...itemFields,
        weight: itemFields.weight ? parseFloat(itemFields.weight) : undefined,
        purchasePrice:
          itemFields.purchasePrice !== ""
            ? parseFloat(itemFields.purchasePrice.replace(/[^0-9.]/g, ""))
            : undefined,
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
          disabled={loading || !isFormValid}
          className={styles.btnAddLotMobile}
        >
          {loading ? "Adding..." : "Add Lot"}
        </button>
      </div>

      <div className={styles.headerTop}>
        <Link href="/inventory" className={styles.backLink}>
          ← Back to Inventory
        </Link>
      </div>

      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.skuTitle}>SKU: _ _ - _ _ - _ _</h1>
          <p className={styles.skuSub}>(auto generated)</p>
        </div>
        <button
          onClick={handleAddLot}
          disabled={loading || !isFormValid}
          className={styles.btnAddLot}
        >
          {loading ? "Adding..." : "Add Lot"}
        </button>
      </div>

      <div className={styles.skuMobile}>
        <h1 className={styles.skuMobileTitle}>SKU: _ _ - _ _ - _ _</h1>
        <p className={styles.skuMobileSub}>(auto generated)</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={uploading || images.length >= 3}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className={styles.layout}>
        <div className={styles.leftCol}>
          <div className={styles.mobileUpload}>
            {images.length === 0 ? (
              <button
                type="button"
                disabled={uploading}
                onClick={triggerUpload}
                className={styles.uploadBtnFull}
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload"}
              </button>
            ) : (
              <div>
                <p className={styles.photosLabel}>Photos</p>
                <div className={styles.photoRow}>
                  {images.map((img, i) => (
                    <div key={i} className={styles.photoThumb}>
                      <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className={styles.removeBtn}
                        aria-label="Remove photo"
                      >
                        <X className="h-3 w-3 text-gray-700" />
                      </button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={triggerUpload}
                      className={styles.addPhotoBtn}
                    >
                      <Upload size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
            {uploadError && <p className={styles.uploadError}>{uploadError}</p>}
          </div>

          <section>
            <Card className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>General Information</h2>
              <div className={styles.fieldGrid}>
                <Field label="Breed" required>
                  <EditableField isEditing value={itemFields.breed} placeholder="Breed" onChange={setItem("breed")} />
                </Field>
                <Field label="Grade" required>
                  <SelectField value={itemFields.grade} onChange={setItem("grade")} options={GRADE_OPTIONS} placeholder="Grade" />
                </Field>
                <Field label="Color" required>
                  <SelectField value={itemFields.color} onChange={setItem("color")} options={COLOR_OPTIONS} placeholder="Color" />
                </Field>
                <Field label="Quantity (lb)" required>
                  <EditableField isEditing value={itemFields.weight} placeholder="0.0" onChange={setItem("weight")} />
                </Field>
                <Field label="Lot Status" required>
                  <SelectField value={itemFields.status} onChange={setItem("status")} options={STATUS_OPTIONS} placeholder="Select status" />
                </Field>
                <Field label="Wool Type" required>
                  <SelectField value={itemFields.type} onChange={setItem("type")} options={TYPE_OPTIONS} placeholder="Select wool type" />
                </Field>
                <Field label="Pallet Location">
                  <EditableField isEditing value={itemFields.palletLocation} placeholder="Pallet Number" onChange={setItem("palletLocation")} />
                </Field>
              </div>
            </Card>
          </section>

          <div className="md:hidden flex flex-col gap-5">
            <Field label="Notes (internal only)">
              <EditableField isEditing value={itemFields.notes} placeholder="Notes" multiline onChange={setItem("notes")} />
            </Field>
            <Field label="Suitable For (shown on public listing)">
              <EditableField isEditing value={itemFields.suitableFor} placeholder="e.g. Rugs, wall hangings, felted decorative items" multiline onChange={setItem("suitableFor")} />
            </Field>
          </div>

          <section>
            <Card className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Purchase Information</h2>
              <div className={styles.fieldGrid}>
                <Field label="Farmer Name" required>
                  <EditableField isEditing value={farmerFormFields.name} placeholder="Farmer" onChange={setFarmerField("name")} />
                </Field>
                <Field label="Farm Name">
                  <EditableField isEditing value={farmName} placeholder="Farm" onChange={setFarmName} />
                </Field>
                <Field label="City">
                  <EditableField isEditing value={farmerFormFields.city} placeholder="City" onChange={setFarmerField("city")} />
                </Field>
                <Field label="State" required>
                  <SelectField value={farmerFormFields.state} onChange={setFarmerField("state")} options={STATE_OPTIONS} placeholder="State" />
                </Field>
                <Field label="Shear Date" required>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={itemFields.shearDate}
                    onChange={(e) => setItem("shearDate")(e.target.value)}
                  />
                </Field>
                <Field label="Intake Price ($/lb)" required>
                  <EditableField isEditing value={itemFields.purchasePrice} placeholder="$0.00" onChange={setItem("purchasePrice")} />
                </Field>
              </div>
            </Card>
          </section>

          <div className={styles.mobileBtns}>
            <button
              onClick={handleAddLot}
              disabled={loading || !isFormValid}
              className={styles.btnAddLotMobile}
            >
              {loading ? "Adding..." : "Add Lot"}
            </button>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.imageGallery}>
            <div
              className={`${styles.mainPreview} ${!previewImage ? styles.mainPreviewEmpty : ""}`}
              onClick={() => !previewImage && triggerUpload()}
            >
              {previewImage ? (
                <Image src={previewImage} alt="Lot photo preview" fill className="object-cover" />
              ) : (
                <ImageIcon className="h-14 w-14 text-gray-300" />
              )}
            </div>

            <div className={styles.thumbnailRow}>
              <button
                type="button"
                disabled={uploading || images.length >= 3}
                onClick={triggerUpload}
                className={styles.uploadTile}
                aria-label="Upload photos"
              >
                <Upload size={18} />
                <span className={styles.uploadTileLabel}>
                  {uploading ? "…" : "Upload"}
                </span>
              </button>

              {images.map((src, idx) => (
                <div
                  key={`${src}-${idx}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveImageIndex(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setActiveImageIndex(idx);
                    }
                  }}
                  className={`${styles.thumbnail} cursor-pointer`}
                >
                  <Image src={src} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className={styles.removeBtn}
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3 text-gray-700" />
                  </button>
                </div>
              ))}
            </div>

            {uploadError && <p className={styles.uploadError}>{uploadError}</p>}
          </div>

          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Notes (internal only)</h2>
            <EditableField
              isEditing
              value={itemFields.notes}
              placeholder="e.g. Condition notes, storage details, special handling instructions"
              multiline
              onChange={setItem("notes")}
            />
          </Card>

          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Suitable For (shown on public listing)</h2>
            <EditableField
              isEditing
              value={itemFields.suitableFor}
              placeholder="e.g. Rugs, wall hangings, felted decorative items"
              multiline
              onChange={setItem("suitableFor")}
            />
          </Card>
        </div>
      </div>
    </main>
  );
}
