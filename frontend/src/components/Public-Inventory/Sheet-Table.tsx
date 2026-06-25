"use client";

import Image from "next/image";
import { Item } from "@/api/items";
import { Card } from "@/components/ui/card";

type SheetTableProps = {
  items: Item[];
};

function formatDate(raw: unknown): string | null {
  if (!raw) return null;
  if (typeof raw === "object" && raw !== null && "seconds" in raw) {
    const d = new Date((raw as { seconds: number }).seconds * 1000);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  const d = new Date(raw as string);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const detailStyle = {
  color: "#686868",
  fontFamily: "var(--sds-typography-body-font-family)",
  fontSize: "14px",
  fontStyle: "normal" as const,
  fontWeight: "400",
  lineHeight: "140%",
};

export default function SheetTable({ items }: SheetTableProps) {
  return (
    <div className="max-h-175 overflow-y-auto pr-2">
      <div className="flex flex-col gap-6">
        {items.map((item) => {
          const tags = [item.grade, item.color].filter(Boolean);
          const suitableForText =
            item.suitableFor?.trim() ||
            "Textiles: Rugs, wall hangings, carpets, and mats\nAccessories: Bags and other sturdy items\nCrafts: Felted decorative items, upholstery";
          const lastUpdated = formatDate(item.updatedAt) ?? formatDate(item.createdAt);

          return (
            <Card
              key={item.id}
              className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex flex-row items-start gap-3 p-3 sm:gap-6 sm:p-6">
                <div className="relative h-24 w-24 flex-none overflow-hidden rounded-xl bg-[#f5f5f5] sm:h-44 sm:w-44 lg:h-55 lg:w-60">
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt={item.sku}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 96px, (max-width: 1024px) 176px, 240px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-3">
                  {tags.length > 0 && (
                    <div
                      className="flex flex-wrap items-center gap-1 uppercase tracking-[0.08em]"
                      style={{ color: "#686868", fontSize: "12px", fontWeight: "400", lineHeight: "140%" }}
                    >
                      {tags.map((tag, index) => (
                        <span key={tag}>
                          {index > 0 && <span className="mr-1 text-black">•</span>}
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2
                    className="text-base font-semibold uppercase sm:text-xl lg:text-2xl"
                    style={{ color: "#000", fontFamily: '"Acumin Pro", "Acumin Pro Regular", sans-serif', lineHeight: "120%" }}
                  >
                    {item.sku}
                  </h2>

                  <div className="grid grid-cols-1 gap-x-10 gap-y-0.5 sm:grid-cols-2">
                    <p style={detailStyle}><span className="font-semibold">Breed:</span> {item.breed ?? "-"}</p>
                    <p style={detailStyle}><span className="font-semibold">Qty Available:</span> {item.weight != null ? `${item.weight} lbs` : "-"}</p>
                    <p style={detailStyle}><span className="font-semibold">Type:</span> {item.type ?? "-"}</p>
                    <p style={detailStyle}><span className="font-semibold">State:</span> {item.farmerState ?? "-"}</p>
                  </div>

                  <div style={detailStyle} className="hidden sm:block">
                    <p className="font-semibold mb-0.5">Suitable For:</p>
                    <p className="whitespace-pre-line">{suitableForText}</p>
                  </div>

                  {lastUpdated && (
                    <p style={{ ...detailStyle, color: "#9ca3af" }}>Last Updated: {lastUpdated}</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
