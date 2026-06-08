"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Item } from "@/api/items";
import EditableField from "@/components/ui/EditableField";
import SelectField, { SelectOption } from "@/components/ui/selectField";
import ItemImageUpload from "@/components/Admin/Inventory/Upload-Image/ItemImageUpload";
import SetCoverPhotoModal from "@/components/Admin/Inventory/SetCoverPhotoModal";
import { Card } from "@/components/ui/card";

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

const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });

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
}: InfoTabProps) {
  const [showCoverModal, setShowCoverModal] = useState(false);

  const qrValue = formData.qrCode ?? item.qrCode ?? itemId;

  const set = (field: keyof Item) => (val: string) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_380px] gap-6 md:gap-12 items-start">
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
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4 md:text-2xl md:mb-5">
                Lot Information
              </h2>
              <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-5">
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
                <Field label="Pallet Location">
                  <EditableField
                    isEditing
                    value={formData.palletLocation ?? ""}
                    placeholder="Pallet Number"
                    onChange={set("palletLocation")}
                  />
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
              </div>
            </Card>
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
            <Card className="p-6">
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
                  <EditableField isEditing value={formData.shearDate ?? ""} placeholder="MM/DD/YYYY" onChange={set("shearDate")} />
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

        <div className="hidden md:flex flex-col gap-4">
          <section
            data-print-label
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  QR Label
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {formData.name ?? item.name}
                </h2>
                <div className="space-y-1 text-sm text-slate-600">
                  <p><span className="font-medium text-slate-900">SKU:</span> {formData.sku ?? item.sku}</p>
                  <p><span className="font-medium text-slate-900">Breed:</span> {formData.breed ?? item.breed ?? "-"}</p>
                  <p><span className="font-medium text-slate-900">Grade:</span> {formData.grade ?? item.grade ?? "-"}</p>
                  <p><span className="font-medium text-slate-900">Status:</span> {formData.status ?? item.status ?? "-"}</p>
                  <p><span className="font-medium text-slate-900">Pallet Location:</span> {formData.palletLocation ?? item.palletLocation ?? "-"}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 self-center rounded-2xl bg-slate-50 p-4">
                <QRCode value={qrValue} size={148} />
                <p className="max-w-[180px] break-all text-center text-xs text-slate-500">{qrValue}</p>
              </div>
            </div>
          </section>

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
            <EditableField isEditing value={formData.notes ?? ""} placeholder="Notes" multiline onChange={set("notes")} />
          </Field>
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
