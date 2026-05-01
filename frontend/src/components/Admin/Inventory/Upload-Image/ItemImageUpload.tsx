"use client";

import { ChangeEvent, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { uploadItemImage } from "@/lib/uploadImage";

type Props = {
  sku: string;
  existingImages: string[];
  onImagesChange: (images: string[]) => void;
  hidePreview?: boolean;
};

export default function ItemImageUpload({ sku, existingImages, onImagesChange, hidePreview = false }: Props) {
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
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={isUploading}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Cover / main preview — clicking opens picker when empty */}
      {!hidePreview && (
        <div
          className="relative w-full aspect-3/4 md:aspect-4/3 rounded-lg border border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => !coverImage && inputRef.current?.click()}
        >
          {coverImage ? (
            <>
              <Image src={coverImage} alt="Cover image" fill className="object-cover" />
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
      )}

      {/* Horizontal scrollable thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-200">
        {existingImages.map((src, idx) => (
          <div
            key={idx}
            className={`group relative flex-shrink-0 w-20 h-28 md:w-16 md:h-16 rounded-md border-2 overflow-hidden cursor-pointer transition-colors ${
              idx === activeIndex ? "border-gray-900" : "border-gray-200 hover:border-gray-400"
            }`}
            onClick={() => setActiveIndex(idx)}
          >
            <Image src={src} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
              className="absolute top-0.5 right-0.5 rounded-full bg-white/90 p-0.5 shadow-sm"
              aria-label="Remove image"
            >
              <X className="h-3 w-3 text-gray-700" />
            </button>
          </div>
        ))}

        {/* + add button — always the last slot */}
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex-shrink-0 w-20 h-28 md:w-16 md:h-16 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 transition-colors text-2xl leading-none"
          aria-label="Add photos"
        >
          {isUploading ? <span className="text-xs">…</span> : <span className="mb-0.5">+</span>}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}