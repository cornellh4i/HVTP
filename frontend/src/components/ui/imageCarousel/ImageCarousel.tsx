"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  renderImage: (src: string, index: number) => React.ReactNode;
  placeholder: React.ReactNode;
  className?: string;
}

export default function ImageCarousel({
  images,
  renderImage,
  placeholder,
  className,
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <div className={className}>{placeholder}</div>;
  }

  if (images.length === 1) {
    return (
      <div className={`relative h-full w-full ${className ?? ""}`}>
        {renderImage(images[0], 0)}
      </div>
    );
  }

  const safeIndex = Math.min(activeIndex, images.length - 1);

  const goTo = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex((index + images.length) % images.length);
  };

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      {images.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className="absolute inset-0 h-full w-full"
          style={{ visibility: i === safeIndex ? "visible" : "hidden" }}
        >
          {renderImage(src, i)}
        </div>
      ))}

      <button
        type="button"
        aria-label="Previous photo"
        onClick={(e) => goTo(safeIndex - 1, e)}
        className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        aria-label="Next photo"
        onClick={(e) => goTo(safeIndex + 1, e)}
        className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
      >
        <ChevronRight size={16} />
      </button>

      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to photo ${i + 1}`}
            onClick={(e) => goTo(i, e)}
            className={`h-1.5 w-1.5 rounded-full ${
              i === safeIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
