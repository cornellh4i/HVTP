"use client";

import { Item } from "@/api/items";
import ItemCard from "./public-itemCard";

type CardTableProps = {
  items: Item[];
};

export default function CardTable({ items }: CardTableProps) {
  return (
    <div className="mx-auto grid w-full max-w-[1273px] grid-cols-1 justify-items-center gap-y-6 xl:grid-cols-3 xl:justify-items-start xl:gap-x-[33.5px]">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}