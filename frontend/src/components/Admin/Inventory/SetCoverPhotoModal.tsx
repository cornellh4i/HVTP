"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { updateItem } from "@/api/items";

interface SetCoverPhotoModalProps {
  itemId: string;
  images: string[];
  currentCoverImages: string[];
  onClose: () => void;
  onSave: (newCoverImages: string[]) => void;
}

export default function SetCoverPhotoModal({
  itemId,
  images,
  currentCoverImages,
  onClose,
  onSave,
}: SetCoverPhotoModalProps) {
  const [selected, setSelected] = useState<string[]>(currentCoverImages);
  const [saving, setSaving] = useState(false);

  const toggle = (url: string) => {
    setSelected((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateItem(itemId, { coverImages: selected });
      onSave(selected);
      onClose();
    } catch {
      alert("Failed to set cover photos");
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

        <h2 className="mb-1 text-base font-semibold text-gray-900">
          Set cover photos for public inventory
        </h2>
        <p className="mb-5 text-sm text-gray-500">
          Select one or more photos. The order you select them in is the order they&apos;ll appear in the carousel.
        </p>

        {/* Image grid — 2 columns, multi-select */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {images.map((url, idx) => {
            const selectedIndex = selected.indexOf(url);
            const isSelected = selectedIndex !== -1;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggle(url)}
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
                {/* Order badge / empty checkbox */}
                <span
                  className={`absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white text-xs font-semibold ${
                    isSelected ? "border-blue-600 text-blue-600" : "border-gray-400 text-transparent"
                  }`}
                >
                  {isSelected ? selectedIndex + 1 : ""}
                </span>
              </button>
            );
          })}
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-gray-900 px-5 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
