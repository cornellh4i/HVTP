"use client";

import { ChangeEvent, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Upload, X } from "lucide-react";
import { uploadItemImage } from "@/lib/uploadImage";

type Props = {
  sku: string;
  existingImages: string[];
  onImagesChange: (images: string[]) => void;
};

export default function ItemImageUpload({ sku, existingImages, onImagesChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const coverImage = existingImages[activeIndex] ?? existingImages[0] ?? null;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const nextIndex = existingImages.length + uploadedUrls.length;
        const url = await uploadItemImage(file, sku, nextIndex);
        uploadedUrls.push(url);
      }

      const newImages = [...existingImages, ...uploadedUrls];
      onImagesChange(newImages);
      // Activate the first newly uploaded image
      setActiveIndex(existingImages.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(index: number) {
    const updated = existingImages.filter((_, i) => i !== index);
    onImagesChange(updated);
    // Adjust active index if needed
    if (activeIndex >= updated.length) {
      setActiveIndex(Math.max(0, updated.length - 1));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Cover / main preview */}
      <div className="relative w-full aspect-[4/3] rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
        {coverImage ? (
          <>
            <Image
              src={coverImage}
              alt="Cover image"
              fill
              className="object-cover"
            />
            {/* "Cover Photo" label shown on the active/first image */}
            {activeIndex === 0 && (
              <span className="absolute top-2 left-2 rounded bg-gray-900/70 px-2 py-0.5 text-[11px] text-white">
                Cover Photo
              </span>
            )}
          </>
        ) : (
          <ImageIcon className="w-14 h-14 text-gray-300" />
        )}
      </div>

      {/* Horizontal scrollable thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-200">
        {existingImages.map((src, idx) => (
          <div
            key={idx}
            className={`group relative flex-shrink-0 w-16 h-16 rounded-md border-2 overflow-hidden cursor-pointer transition-colors ${
              idx === activeIndex ? "border-gray-900" : "border-gray-200 hover:border-gray-400"
            }`}
            onClick={() => setActiveIndex(idx)}
          >
            <Image
              src={src}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-cover"
            />
            {/* Remove button — always visible */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage(idx);
              }}
              className="absolute top-0.5 right-0.5 rounded-full bg-white/90 p-0.5 shadow-sm"
              aria-label="Remove image"
            >
              <X className="h-3 w-3 text-gray-700" />
            </button>
          </div>
        ))}

        {/* Always trail enough empty slots so the strip looks full (min 5 total, then +3 beyond that) */}
        {Array.from({ length: Math.max(5 - existingImages.length, 3) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex-shrink-0 w-16 h-16 rounded-md border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center"
          >
            <ImageIcon className="w-5 h-5 text-gray-300" />
          </div>
        ))}
      </div>

      {/* Upload button */}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isUploading}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload photos"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}