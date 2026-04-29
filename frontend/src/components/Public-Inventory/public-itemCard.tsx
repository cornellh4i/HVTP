"use client";

import React from "react";
import {
  Card,
} from "@/components/ui/card";
import { Item } from "@/api/items";

interface ItemCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const statusTag = item.status?.split(" ")[0] ?? item.status;
  const hasImage = Boolean(item.coverImage);
  const tags = [item.grade, item.color, statusTag].filter(Boolean);
  const suitableForText =
    item.notes?.trim() ||
    "Textiles: Rugs, wall hangings, carpets, and mats\nAccessories: Bags and other sturdy items\nCrafts: Felted decorative items, upholstery";
  const detailRows = [
    { label: "Breed", value: item.breed ?? "-" },
    { label: "Quantity", value: item.weight ? `${item.weight} lbs` : "-" },
    { label: "Price (per lb)", value: item.purchasePrice ? `$${item.purchasePrice}` : "-" },
    { label: "State", value: item.farmerState ?? "NY" },
  ];

  return (
    <Card className="box-border flex flex-col overflow-hidden rounded-[15px] border-none shadow-none hover:shadow-none" style={{ width: "402px", height: "483.2px", backgroundColor: "#E7E7E7" }}>
      <div className="flex h-full flex-col px-[30px] py-[20px]">
        <div className="h-[205.2px] w-full overflow-hidden rounded-[15px] bg-[#f5f5f5]">
          {hasImage ? (
            <img
              src={item.coverImage}
              alt={item.sku}
              className="h-[205.2px] w-full rounded-[15px] object-cover"
            />
          ) : (
            <div className="flex h-[205.2px] w-full items-center justify-center rounded-[15px] bg-white text-slate-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-0 pt-[25px]">
          {tags.length > 0 && (
            <div
              className="flex w-full flex-wrap items-center justify-start gap-2 uppercase tracking-[0.08em]"
              style={{
                paddingBottom: "16px",
                color: "#686868",
                fontFamily: '"Inter", sans-serif',
                fontSize: "14px",
                fontStyle: "normal",
                fontWeight: "400",
                lineHeight: "140%",
              }}
            >
              {tags.map((tag, index) => (
                <React.Fragment key={tag}>
                  {index > 0 && <span className="leading-none text-black">•</span>}
                  <span>{tag}</span>
                </React.Fragment>
              ))}
            </div>
          )}

          <h2
            className="text-[24px] font-semibold uppercase tracking-[0%] [font-family:'Acumin_Pro']"
            style={{
              marginBottom: "16px",
              color: "#000",
              fontFamily: '"Acumin Pro", "Acumin Pro Regular", sans-serif',
              fontStyle: "normal",
              lineHeight: "120%",
            }}
          >
            SKU: {item.sku}
          </h2>

          <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {detailRows.map((detail) => (
              <p
                key={detail.label}
                className="leading-snug"
                style={{
                  color: "#686868",
                  fontFamily: "var(--sds-typography-body-font-family)",
                  fontSize: "14px",
                  fontStyle: "normal",
                  fontWeight: "400",
                  lineHeight: "140%",
                }}
              >
                <span className="font-semibold">{detail.label}: </span>
                <span className="font-normal">{detail.value}</span>
              </p>
            ))}
          </div>

          <div className="mt-1 text-[14px]">
            <p className="font-semibold" style={{ color: "#686868" }}>Suitable For:</p>
            <p
              className="whitespace-pre-line"
              style={{
                color: "#686868",
                fontFamily: "var(--sds-typography-body-font-family)",
                fontSize: "14px",
                fontStyle: "normal",
                fontWeight: "var(--sds-typography-body-font-weight-regular)",
                lineHeight: "140%",
              }}
            >
              {suitableForText}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ItemCard;