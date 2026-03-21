import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
}

const PlaceholderImage = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-slate-400 sm:h-16 sm:w-16 lg:h-18.5 lg:w-18.5"
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
  ({ sku, description, breed, quantity, status, state, href, imgSrc }, ref) => (
    <Card ref={ref} className="w-full max-w-4xl p-3 sm:p-4 lg:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-6">

        {/* Image area */}
        <div className="flex h-22.5 w-full shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 sm:h-27.5 sm:w-50 lg:h-32.5 lg:w-60">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={sku}
              width={240}
              height={130}
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <PlaceholderImage />
          )}
        </div>

        {/* Content area */}
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <CardHeader className="gap-1 p-0">
              <CardDescription className="text-xs sm:text-sm">
                {description}
              </CardDescription>
              <CardTitle className="truncate text-base sm:text-lg lg:text-xl">
                {sku}
              </CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-x-6 gap-y-1 px-0 pb-0 pt-2 text-sm sm:grid-cols-2 sm:pt-3 lg:text-base">
              <p>
                <span className="font-semibold">Breed:</span> {breed}
              </p>
              <p>
                <span className="font-semibold">Quantity Available:</span> {quantity}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {status}
              </p>
              <p>
                <span className="font-semibold">State:</span> {state}
              </p>
            </CardContent>
          </div>

          <CardFooter className="shrink-0 px-0 py-0 sm:self-center">
            <Button asChild className="w-full sm:w-auto">
              <Link href={href}>View Fiber</Link>
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
);
ItemCard.displayName = "ItemCard";

export { ItemCard };
export type { ItemCardProps };
