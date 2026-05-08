"use client";

import { Item } from "@/api/items";
import ItemCard from "./public-itemCard";

type CardTableProps = {
  items: Item[];
};

export default function CardTable({ items }: CardTableProps) {
  return (
    <div className="max-h-175 overflow-y-auto pr-2">
      <div className="mx-auto grid w-full max-w-[1273px] grid-cols-1 gap-y-6 p-4 md:grid-cols-2 md:gap-x-6 xl:grid-cols-3 xl:gap-x-[33.5px]">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}