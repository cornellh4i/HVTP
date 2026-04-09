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

  const images = existingImages.slice(0, 3);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const remaining = 3 - images.length;
    const selected = files.slice(0, remaining);

    setIsUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of selected) {
        const nextIndex = images.length + uploadedUrls.length;
        const url = await uploadItemImage(file, sku, nextIndex);
        uploadedUrls.push(url);
      }

      onImagesChange([...images, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(index: number) {
    onImagesChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full aspect-square rounded-lg border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
        {images[0] ? (
          <Image src={images[0]} alt="Cover image" width={600} height={600} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="w-16 h-16 text-gray-300" />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((idx) => {
          const src = images[idx];
          return (
            <div key={idx} className="relative aspect-square rounded-md border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
              {src ? (
                <>
                  <Image src={src} alt={`Item image ${idx + 1}`} width={200} height={200} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 rounded-full bg-white/90 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-300" />
              )}
            </div>
          );
        })}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isUploading || images.length >= 3}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={isUploading || images.length >= 3}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload photos"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
