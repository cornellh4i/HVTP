import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import styles from "./itemCard.module.css";

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
  ctaLabel?: string;
  isPublic?: boolean;
}

const PlaceholderImage = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={styles.placeholderSvg}
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
      ctaLabel,
      isPublic,
    },
    ref
  ) => {
    const details = desktopDetails ?? [
      { label: "Breed", value: breed },
      { label: "Quantity Available", value: quantity },
      { label: "Status", value: status },
      { label: "State", value: state },
    ];

    const buttonLabel = actionLabel ?? ctaLabel ?? "View Lot";

    return (
    <Card ref={ref} className={styles.card}>
      <div className={styles.cardRow}>

        {/* Image — small square on mobile, larger on desktop */}
        <div className={styles.imageWrapper}>
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={sku}
              width={240}
              height={176}
              className={styles.image}
            />
          ) : (
            <PlaceholderImage />
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.contentLeft}>
            {/* Grade • Color */}
            <p className={styles.description}>
              {description}
            </p>

            {/* SKU + published badge */}
            <div className={styles.skuRow}>
              <p className={styles.sku}>{title ?? sku}</p>
              {isPublic ? (
                <span className={styles.publishedBadge}>
                  <span className={styles.publishedDot} />
                  Published
                </span>
              ) : (
                <span className={styles.unpublishedBadge}>
                  <span className={styles.unpublishedDot} />
                  Unpublished
                </span>
              )}
            </div>

            {subtitle ? (
              <p className={styles.subtitle}>{subtitle}</p>
            ) : null}

            {/* Mobile: single condensed line */}
            <p className={styles.mobileSummary}>
              {mobileSummary ?? `${breed} / ${status} / ${quantity} / ${state}`}
            </p>

            {/* Desktop: grid of fields */}
            <div className={styles.desktopDetails}>
              {details.map((detail) => (
                <p key={detail.label}>
                  <span className="font-semibold">{detail.label}:</span> {detail.value}
                </p>
              ))}
            </div>

            {lastUpdated && (
              <p className={styles.lastUpdated}>Last Updated: {lastUpdated}</p>
            )}

            <Button asChild size="sm" className={styles.mobileButton}>
              <Link href={href}>{buttonLabel}</Link>
            </Button>
          </div>


          {/* Desktop: full button */}
          <Button asChild className={styles.desktopButton}>
            <Link href={href}>{buttonLabel}</Link>
          </Button>
        </div>

      </div>
    </Card>
    );
  }
);
ItemCard.displayName = "ItemCard";

export { ItemCard };
export type { ItemCardProps };
