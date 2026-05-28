import { ItemCard } from "@/components/ui/itemCard/itemCard";
import { Item } from "@/api/items";
import { formatItemDate } from "@/components/Admin/Inventory/inventory-utils";
import styles from "./Card-Table.module.css";

export default function CardTable({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <main className={styles.emptyMain}>
        <div className={styles.emptyContent}>
          No inventory items match the current filters.
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.cardList}>
        {items.map((item) => (
          <ItemCard
            key={item.id}
            imgSrc={item.coverImage ?? item.images?.[0]}
            sku={item.sku}
            description={`${item.grade ?? ""} • ${item.color ?? ""}`}
            breed={item.breed ?? ""}
            quantity={item.weight ? `${item.weight} lbs` : "-"}
            status={item.status ?? ""}
            state={item.farmerState ?? ""}
            href={`/inventory/${item.id}`}
            lastUpdated={formatItemDate(item.createdAt)}
            ctaLabel="Edit Lot"
            isPublic={item.isPublic}
          />
        ))}
      </div>
    </main>
  );
}
