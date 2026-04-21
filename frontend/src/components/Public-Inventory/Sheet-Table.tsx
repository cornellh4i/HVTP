"use client";

import Image from "next/image";
import { Item } from "@/api/items";
import { Card } from "@/components/ui/card";

type SheetTableProps = {
  items: Item[];
};

export default function SheetTable({ items }: SheetTableProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {items.map((item) => {
        const tags = [item.grade, item.color, item.status].filter(Boolean);
        const suitableForText =
          item.notes?.trim() ||
          "Textiles: Rugs, wall hangings, carpets, and mats\nAccessories: Bags and other sturdy items\nCrafts: Felted decorative items, upholstery";

        return (
          <Card
            key={item.id}
            className="h-[292px] w-[1273px] overflow-hidden border-[#E0E0E0] bg-[#F5F5F5] pb-4 pl-[40px] pr-4 pt-4 shadow-sm hover:shadow-sm"
          >
            <div className="flex h-full flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
              <div className="relative min-h-[220px] w-full overflow-hidden rounded-2xl bg-white lg:w-[260px] lg:flex-none">
                {item.coverImage ? (
                  <Image
                    src={item.coverImage ?? ""}
                    alt={item.sku}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 260px"
                  />
                ) : (
                  <div className="flex h-full min-h-[220px] items-center justify-center text-slate-400">
                    No image
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
                <div>
                  {tags.length > 0 && (
                    <div
                      className="flex w-full flex-wrap items-center gap-2 uppercase tracking-[0.08em]"
                      style={{
                        color: "#686868",
                        fontFamily: '"Inter", sans-serif',
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: "600",
                        lineHeight: "140%",
                      }}
                    >
                      {tags.map((tag, index) => (
                        <span key={tag}>
                          {index > 0 ? " • " : ""}
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 space-y-1">
                    <h2
                      className="truncate text-[24px] font-semibold uppercase tracking-[0%]"
                      style={{
                        color: "#000",
                        fontFamily: '"Acumin Pro", "Acumin Pro Regular", sans-serif',
                        fontStyle: "normal",
                        lineHeight: "120%",
                      }}
                    >
                      SKU: {item.sku}
                    </h2>
                  </div>

                  <div className="mt-[22px] inline-grid grid-cols-[max-content_max-content] gap-x-[55px] gap-y-1">
                    <p
                      style={{
                        color: "#686868",
                        fontFamily: "var(--sds-typography-body-font-family)",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: "400",
                        lineHeight: "140%",
                      }}
                    >
                      <span className="font-semibold">Breed:</span> {item.breed ?? "-"}
                    </p>
                    <p
                      style={{
                        color: "#686868",
                        fontFamily: "var(--sds-typography-body-font-family)",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: "400",
                        lineHeight: "140%",
                      }}
                    >
                      <span className="font-semibold">Quantity Available:</span>{" "}
                      {item.weight !== undefined && item.weight !== null ? `${item.weight} lbs` : "-"}
                    </p>
                    <p
                      style={{
                        color: "#686868",
                        fontFamily: "var(--sds-typography-body-font-family)",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: "400",
                        lineHeight: "140%",
                      }}
                    >
                      <span className="font-semibold">Price (per lb):</span>{" "}
                      {item.purchasePrice !== undefined && item.purchasePrice !== null ? `$${item.purchasePrice}` : "-"}
                    </p>
                    <p
                      style={{
                        color: "#686868",
                        fontFamily: "var(--sds-typography-body-font-family)",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: "400",
                        lineHeight: "140%",
                      }}
                    >
                      <span className="font-semibold">State:</span> {item.farmerState ?? "NY"}
                    </p>
                  </div>

                  <div
                    className="mt-1"
                    style={{
                      color: "#686868",
                      fontFamily: "var(--sds-typography-body-font-family)",
                      fontSize: "14px",
                      fontStyle: "normal",
                      fontWeight: "400",
                      lineHeight: "140%",
                    }}
                  >
                    <p
                      style={{
                        marginBottom: "2px",
                      }}
                    >
                      <span className="font-semibold">Suitable For:</span>
                    </p>
                    <p className="whitespace-pre-line">{suitableForText}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}