import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ItemCardProps {
  sku: string;
  description: string;
  breed: string;
  quantity: string;
  status: string;
  state: string;
  href: string;
  imgSrc?: string;
  lastUpdated?: string;
  title?: string;
  subtitle?: string;
  mobileSummary?: string;
  desktopDetails?: Array<{
    label: string;
    value: string;
  }>;
  actionLabel?: string;
}

const PlaceholderImage = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-slate-400 sm:h-12 sm:w-12 lg:h-16 lg:w-16"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1" />
    <circle cx="8.5" cy="8.5" r="1.75" stroke="currentColor" strokeWidth="1" />
    <path
      d="M4.5 18L11 11.5C11.5 11 12.3 11 12.9 11.5L16 14.2C16.6 14.7 17.4 14.7 17.9 14.2L19.5 12.7"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const ItemCard = React.forwardRef<HTMLDivElement, ItemCardProps>(
  (
    {
      sku,
      description,
      breed,
      quantity,
      status,
      state,
      href,
      imgSrc,
      lastUpdated,
      title,
      subtitle,
      mobileSummary,
      desktopDetails,
      actionLabel,
    },
    ref
  ) => {
    const details = desktopDetails ?? [
      { label: "Breed", value: breed },
      { label: "Quantity Available", value: quantity },
      { label: "Status", value: status },
      { label: "State", value: state },
    ];

    return (
    <Card ref={ref} className="relative w-full max-w-5xl rounded-xl p-2 sm:p-3 lg:p-4">
      {/* Mobile: pen icon top right */}
      <Link href={href} className="absolute right-3 top-3 text-slate-400 sm:hidden">
        <Pencil size={16} />
      </Link>
      <div className="flex flex-row items-center gap-3 sm:gap-4 lg:gap-6">

        {/* Image — small square on mobile, larger on desktop */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 sm:h-32 sm:w-32 lg:h-44 lg:w-60 lg:rounded-2xl">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={sku}
              width={240}
              height={176}
              className="h-full w-full rounded-xl object-cover lg:rounded-2xl"
            />
          ) : (
            <PlaceholderImage />
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            {/* Grade • Color */}
            <p className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
              {description}
            </p>

            {/* SKU */}
            <p className="truncate text-sm font-bold sm:text-lg lg:text-xl">{title ?? sku}</p>

            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-slate-600 sm:text-sm">{subtitle}</p>
            ) : null}

            {/* Mobile: single condensed line */}
            <p className="mt-0.5 truncate text-xs text-slate-600 sm:hidden">
              {mobileSummary ?? `${breed} / ${status} / ${quantity} / ${state}`}
            </p>

            {/* Desktop: grid of fields */}
            <div className="mt-2 hidden grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid lg:text-base">
              {details.map((detail) => (
                <p key={detail.label}>
                  <span className="font-semibold">{detail.label}:</span> {detail.value}
                </p>
              ))}
            </div>

            {lastUpdated && (
              <p className="mt-1 hidden text-xs text-slate-400 sm:block">Last Updated: {lastUpdated}</p>
            )}
          </div>


          {/* Desktop: full button */}
          <Button asChild className="hidden shrink-0 sm:block">
            <Link href={href}>{actionLabel ?? "View Lot"}</Link>
          </Button>
        </div>

      </div>
    </Card>
  )
}
);
ItemCard.displayName = "ItemCard";

export { ItemCard };
export type { ItemCardProps };
