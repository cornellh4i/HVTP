"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { updateItem } from "@/api/items";

interface SetCoverPhotoModalProps {
  itemId: string;
  images: string[];
  currentCover: string;
  onClose: () => void;
  onSave: (newCover: string) => void;
}

export default function SetCoverPhotoModal({
  itemId,
  images,
  currentCover,
  onClose,
  onSave,
}: SetCoverPhotoModalProps) {
  const [selected, setSelected] = useState<string>(currentCover);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateItem(itemId, { coverImage: selected });
      onSave(selected);
      onClose();
    } catch {
      alert("Failed to set cover photo");
    } finally {
      setSaving(false);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {/* Modal */}
      <div className="relative w-[520px] max-h-[90vh] overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-xl">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="mb-5 text-base font-semibold text-gray-900">
          Set cover photo for public inventory
        </h2>

        {/* Image grid — 2 columns, radio-style selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {images.map((url, idx) => {
            const isSelected = url === selected;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelected(url)}
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
                {/* Radio dot */}
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

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !selected}
            className="rounded bg-gray-900 px-5 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}