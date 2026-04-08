import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Item } from "@/api/items";

interface ItemCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const tags = [item.grade, item.color, item.status].filter(Boolean);

  return (
    <Card className="w-full max-w-[402px] p-4 sm:p-5">

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {item.coverImage || item.imageUrl ? (
          <img
            src={item.coverImage ?? item.imageUrl}
            alt={item.sku}
            className="h-[205px] w-full object-cover"
          />
        ) : (
          <div className="flex h-[205px] items-center justify-center text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
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

      <div className="flex flex-col gap-4">
        <CardHeader className="gap-2 p-0">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <CardTitle className="text-xl leading-tight text-slate-900">
            SKU: {item.sku}
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            {item.grade && item.color
              ? `${item.grade} · ${item.color}`
              : item.grade ?? item.color ?? ""}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-3 px-0 pb-0 pt-0 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <p className="font-semibold text-slate-900">Breed</p>
            <p>{item.breed ?? "—"}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Quantity</p>
            <p>{item.weight ? `${item.weight} lbs` : "—"}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Status</p>
            <p>{item.status ?? "—"}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">State</p>
            <p>{item.farmerState ?? "—"}</p>
          </div>
        </CardContent>

        {item.notes && (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            <p className="mb-2 font-semibold text-slate-900">Suitable For</p>
            <p className="whitespace-pre-line">{item.notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ItemCard;