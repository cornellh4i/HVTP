import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Item } from "@/api/items";

interface ItemCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const statusTag = item.status?.split(" ")[0] ?? item.status;
  const tags = [item.grade, item.color, statusTag].filter(Boolean);
  const suitableForText =
    item.notes?.trim() ||
    "Textiles: Rugs, wall hangings, carpets, and mats\nAccessories: Bags and other sturdy items\nCrafts: Felted decorative items, upholstery";
  const detailRows = [
    { label: "Breed", value: item.breed ?? "-" },
    { label: "Quantity", value: item.weight ? `${item.weight} lbs` : "-" },
    { label: "Status", value: item.status ?? "-" },
    { label: "State", value: item.farmerState ?? "-" },
  ];

  return (
    <Card className="w-full max-w-[420px] rounded-[22px] border border-slate-300 bg-[#e7e7e7] p-5 shadow-none sm:p-6">
      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-[#f5f5f5]">
        {item.coverImage || item.imageUrl ? (
          <img
            src={item.coverImage ?? item.imageUrl}
            alt={item.sku}
            className="h-[225px] w-full object-cover"
          />
        ) : (
          <div className="flex h-[225px] items-center justify-center text-slate-500">
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

      <CardContent className="flex h-full flex-col px-0 pb-0 pt-6">
        {tags.length > 0 && (
          <div
            className="flex flex-wrap items-center gap-2 uppercase tracking-[0.08em]"
            style={{
              color: "#686868",
              fontFamily: "var(--sds-typography-body-font-family)",
              fontSize: "var(--sds-typography-body-size-small)",
              fontStyle: "normal",
              fontWeight: "var(--sds-typography-body-font-weight-regular)",
              lineHeight: "140%",
            }}
          >
            {tags.map((tag, index) => (
              <React.Fragment key={tag}>
                {index > 0 && <span className="text-[0.95rem] leading-none">•</span>}
                <span className="text-[0.95rem]">{tag}</span>
              </React.Fragment>
            ))}
          </div>
        )}

        <h2
          className="mt-4 uppercase text-black text-[var(--sds-typography-heading-size-base)] font-[var(--sds-typography-heading-font-weight)] leading-[120%]"
          style={{ fontFamily: '"Acumin Pro", sans-serif' }}
        >
          SKU: {item.sku}
        </h2>

        <div className="mt-4 grid gap-x-8 gap-y-1 text-[1.1rem] text-slate-700 sm:grid-cols-2">
          {detailRows.map((detail) => (
            <p key={detail.label} className="leading-snug">
              <span className="font-bold text-slate-700">{detail.label}: </span>
              <span>{detail.value}</span>
            </p>
          ))}
        </div>

        <div className="mt-3 text-[1.1rem] leading-snug text-slate-700">
          <p className="font-bold text-slate-700">Suitable For:</p>
          <p className="whitespace-pre-line">{suitableForText}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemCard;