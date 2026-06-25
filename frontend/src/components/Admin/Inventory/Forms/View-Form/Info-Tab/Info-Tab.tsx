"use client";

import { ChangeEvent, useRef, useState } from "react";
import Image from "next/image";
import { Item } from "@/api/items";
import EditableField from "@/components/ui/EditableField";
import SelectField, { SelectOption } from "@/components/ui/selectField";
import ItemImageUpload from "@/components/Admin/Inventory/Upload-Image/ItemImageUpload";
import SetCoverPhotoModal from "@/components/Admin/Inventory/SetCoverPhotoModal";
import { uploadItemImage } from "@/lib/uploadImage";
import { Card } from "@/components/ui/card";
import { Check, ImageIcon, Star, Upload } from "lucide-react";
import styles from "./Info-Tab.module.css";

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
    <div className="flex flex-col gap-1.5 w-full [&_input]:h-[44px] [&_input]:rounded-lg [&_input]:border [&_input]:border-gray-300 [&_input]:px-4 [&_input]:py-3 [&_select]:h-[44px] [&_select]:rounded-lg [&_select]:border [&_select]:border-gray-300 [&_select]:px-4 [&_select]:py-3">
      <label className="text-sm text-gray-600">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function DesktopImageGallery({
  sku,
  images,
  onImagesChange,
  coverImage,
  onCoverChange,
}: {
  sku: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  coverImage: string;
  onCoverChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverUrl = coverImage || images[0] || "";
  const safeActiveIndex = images.length ? Math.min(activeIndex, images.length - 1) : 0;
  const previewUrl = images[safeActiveIndex] ?? null;
  const isCoverPreview = Boolean(previewUrl && previewUrl === coverUrl);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const nextIndex = images.length + uploadedUrls.length;
        const url = await uploadItemImage(file, sku, nextIndex);
        uploadedUrls.push(url);
      }

      const newImages = [...images, ...uploadedUrls];
      onImagesChange(newImages);

      if (!coverUrl && newImages.length > 0) {
        onCoverChange(newImages[0]);
      }

      setActiveIndex(images.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  const handleSetCover = () => {
    if (previewUrl && !isCoverPreview) {
      onCoverChange(previewUrl);
    }
  };

  return (
    <div className={styles.imageGallery}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={isUploading}
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        className={`${styles.mainPreview} ${!previewUrl ? styles.mainPreviewEmpty : ""}`}
        onClick={() => !previewUrl && inputRef.current?.click()}
      >
        {previewUrl ? (
          <Image src={previewUrl} alt="Lot photo preview" fill className="object-cover" />
        ) : (
          <ImageIcon className="h-14 w-14 text-gray-300" />
        )}

        {previewUrl &&
          (isCoverPreview ? (
            <span className={styles.coverBadge}>
              <Star
                size={12}
                className={styles.coverStarActive}
                fill="currentColor"
              />
              Cover
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSetCover();
              }}
              className={`${styles.coverBadge} ${styles.coverBadgeInteractive}`}
            >
              <Star size={12} className={styles.coverStarInactive} fill="none" />
              Cover
            </button>
          ))}
      </div>

      <div className={styles.thumbnailRow}>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className={styles.uploadTile}
          aria-label="Upload photos"
        >
          <Upload size={18} />
          <span className={styles.uploadTileLabel}>
            {isUploading ? "…" : "Upload"}
          </span>
        </button>

        {images.map((src, idx) => {
          const isCover = src === coverUrl;
          const isActive = idx === safeActiveIndex;

          return (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`${styles.thumbnail} ${
                isCover ? styles.thumbnailCover : isActive ? styles.thumbnailActive : ""
              }`}
            >
              <Image src={src} alt={`Photo ${idx + 1}`} fill className="object-cover" />
              {isCover && (
                <span className={styles.coverCheck}>
                  <span className={styles.coverCheckCircle}>
                    <Check className={styles.coverCheckIcon} strokeWidth={3} />
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && <p className={styles.uploadError}>{error}</p>}
    </div>
  );
}

type InfoTabProps = {
  itemId: string;
  item: Item;
  formData: Partial<Item>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Item>>>;
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  saving: boolean;
  onPublish: () => void;
  onSave: () => void;
  onStatusChange: (status: string) => void;
};

export default function InfoTab({
  itemId,
  item,
  formData,
  setFormData,
  images,
  setImages,
  saving,
  onPublish,
  onSave,
  onStatusChange,
}: InfoTabProps) {
  const [farmName, setFarmName] = useState("");
  const [showCoverModal, setShowCoverModal] = useState(false);

  const set = (field: keyof Item) => (val: string) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  const coverImage = formData.coverImage ?? images[0] ?? "";

  const handleCoverChange = (url: string) => {
    setFormData((prev) => ({ ...prev, coverImage: url }));
  };

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
    const currentCover = formData.coverImage ?? images[0] ?? "";
    if (currentCover && !newImages.includes(currentCover)) {
      setFormData((prev) => ({
        ...prev,
        coverImage: newImages[0] ?? "",
      }));
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 md:gap-8 items-start">
        <div className="flex flex-col gap-6 md:gap-10 min-w-0">
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
            <Card className={styles.sectionCard}>
              <h2 className="text-lg font-bold mb-4 md:mb-5">
                General Information
              </h2>
              <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-5">
                <Field label="Breed" required>
                  <EditableField isEditing value={formData.breed ?? ""} placeholder="Breed" onChange={set("breed")} />
                </Field>
                <Field label="Grade" required>
                  <SelectField value={formData.grade ?? ""} onChange={set("grade")} options={GRADE_OPTIONS} placeholder="Grade" />
                </Field>
                <Field label="Color" required>
                  <SelectField value={formData.color ?? ""} onChange={set("color")} options={COLOR_OPTIONS} placeholder="Color" />
                </Field>
                <Field label="Original Weight (lb)" required>
                  <EditableField isEditing value={String(formData.weight ?? "")} placeholder="Weight" onChange={set("weight")} />
                </Field>
                <Field label="Remaining Weight (lb)">
                  <EditableField
                    isEditing={false}
                    value={String(formData.remainingWeight ?? formData.weight ?? "")}
                    placeholder="Remaining"
                  />
                </Field>
                <Field label="Lot Status" required>
                  <SelectField value={formData.status ?? ""} onChange={onStatusChange} options={STATUS_OPTIONS} placeholder="Status" />
                </Field>
                <Field label="Wool Type" required>
                  <SelectField
                    value={(formData as { type?: string }).type ?? ""}
                    onChange={(v) => setFormData((p) => ({ ...p, type: v }))}
                    options={TYPE_OPTIONS}
                    placeholder="Type"
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
              </div>
            </Card>
          </section>

          <div className="md:hidden flex flex-col gap-5">
            <Field label="Notes (internal only)">
              <EditableField
                isEditing
                value={formData.notes ?? ""}
                placeholder="e.g. Condition notes, storage details, special handling instructions"
                multiline
                onChange={set("notes")}
              />
            </Field>
            <Field label="Suitable For (shown on public listing)">
              <EditableField
                isEditing
                value={formData.suitableFor ?? ""}
                placeholder="e.g. Rugs, wall hangings, felted decorative items"
                multiline
                onChange={set("suitableFor")}
              />
            </Field>
          </div>

          <section>
            <Card className={styles.sectionCard}>
              <h2 className="text-lg font-bold mb-4 md:mb-5">
                Purchase Information
              </h2>
              <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-5">
                <Field label="Farmer Name" required>
                  <EditableField
                    isEditing
                    value={formData.farmerName ?? ""}
                    placeholder="Name"
                    onChange={set("farmerName")}
                  />
                </Field>
                <Field label="Farm Name">
                  <EditableField
                    isEditing
                    value={farmName}
                    placeholder="Farm Name"
                    onChange={setFarmName}
                  />
                </Field>
                <Field label="City">
                  <EditableField
                    isEditing
                    value={formData.farmerCity ?? ""}
                    placeholder="City"
                    onChange={set("farmerCity")}
                  />
                </Field>
                <Field label="State" required>
                  <SelectField
                    value={formData.farmerState ?? ""}
                    onChange={set("farmerState")}
                    options={STATE_OPTIONS}
                    placeholder="State"
                  />
                </Field>
                <Field label="Shear Date" required>
                  <EditableField isEditing value={formData.shearDate ?? ""} placeholder="MM/DD/YYYY" onChange={set("shearDate")} />
                </Field>
                <Field label="Intake Price ($/lb)" required>
                  <EditableField
                    isEditing
                    value={String(formData.purchasePrice ?? "")}
                    placeholder="Price"
                    onChange={set("purchasePrice")}
                  />
                </Field>
              </div>
            </Card>
          </section>

          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={onPublish}
                className="w-full rounded-lg bg-[#9F9E97] px-4 py-3 text-sm text-white hover:bg-[#8a897e]"
              >
                {formData.isPublic ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="w-full rounded-lg bg-[#2C2C2C] px-4 py-3 text-sm text-white hover:bg-[#1A1A1A] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-6">
          <DesktopImageGallery
            sku={item.sku}
            images={images}
            onImagesChange={handleImagesChange}
            coverImage={coverImage}
            onCoverChange={handleCoverChange}
          />

          <Card className={styles.sectionCard}>
            <h2 className="text-lg font-bold mb-4">Notes (internal only)</h2>
            <EditableField
              isEditing
              value={formData.notes ?? ""}
              placeholder="e.g. Condition notes, storage details, special handling instructions"
              multiline
              onChange={set("notes")}
            />
          </Card>

          <Card className={styles.sectionCard}>
            <h2 className="text-lg font-bold mb-4">Suitable For (shown on public listing)</h2>
            <EditableField
              isEditing
              value={formData.suitableFor ?? ""}
              placeholder="e.g. Rugs, wall hangings, felted decorative items"
              multiline
              onChange={set("suitableFor")}
            />
          </Card>
        </div>
      </div>

      {showCoverModal && (
        <SetCoverPhotoModal
          itemId={itemId}
          images={images}
          currentCover={formData.coverImage ?? images[0] ?? ""}
          onClose={() => setShowCoverModal(false)}
          onSave={(newCover) => setFormData((p) => ({ ...p, coverImage: newCover }))}
        />
      )}
    </>
  );
}
