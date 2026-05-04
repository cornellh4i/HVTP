"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, TriangleAlert } from "lucide-react";

import { getItemById, Item } from "@/api/items";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQrScanner } from "@/hooks/useQrScanner";
import { ItemCard } from "@/components/ui/itemCard";
import { Button } from "@/components/ui/button";

type ScanState = "scanning" | "loading" | "found" | "not_found" | "error";

function getItemSummary(item: Item) {
  return [item.breed, item.grade, item.status, item.palletLocation]
    .filter(Boolean)
    .join(" / ");
}

export default function QrScanner() {
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanHandledRef = useRef(false);
  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [item, setItem] = useState<Item | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleResult = useCallback(
    async (scannedText: string) => {
      const itemId = scannedText.trim();
      if (!itemId || scanHandledRef.current) {
        return;
      }

      scanHandledRef.current = true;
      setScanState("loading");
      setMessage(null);
      stop();

      try {
        const foundItem = await getItemById(itemId);
        setItem(foundItem);
        setScanState("found");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to find that item.";
        setItem(null);
        setMessage(
          errorMessage.toLowerCase().includes("not found")
            ? "No item matched that QR code."
            : errorMessage
        );
        setScanState(
          errorMessage.toLowerCase().includes("not found") ? "not_found" : "error"
        );
      }
    },
    []
  );

  const { start, stop, status, error } = useQrScanner({
    videoRef,
    onResult: handleResult,
  });

  useEffect(() => {
    if (!isMobile) {
      stop();
      return;
    }

    if (scanState === "scanning") {
      start();
      return;
    }

    stop();
  }, [isMobile, scanState, start, stop]);

  useEffect(() => {
    if (!error) {
      return;
    }

    setMessage(error);
    setScanState("error");
  }, [error]);

  const resetScanner = useCallback(() => {
    scanHandledRef.current = false;
    setItem(null);
    setMessage(null);
    setScanState("scanning");
  }, []);

  if (!isMobile) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-base font-semibold text-slate-900">Scanner is mobile-only</p>
        <p className="mt-2 text-sm text-slate-500">
          Open this page on a phone over HTTPS to use the camera scanner.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        {(scanState === "scanning" || scanState === "loading") && (
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 p-6">
                <div className="relative h-full w-full rounded-[32px] border border-white/30">
                  <div className="absolute left-6 top-6 h-14 w-14 rounded-tl-2xl border-l-4 border-t-4 border-white" />
                  <div className="absolute bottom-6 right-6 h-14 w-14 rounded-br-2xl border-b-4 border-r-4 border-white" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                {scanState === "loading"
                  ? "Looking up item..."
                  : status === "starting"
                  ? "Starting camera..."
                  : "Scanning..."}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Align the QR code inside the frame.
              </p>
            </div>
          </div>
        )}

        {scanState === "found" && item && (
          <div className="space-y-4">
            <ItemCard
              sku={item.sku}
              title={item.sku}
              description={`${item.name}${item.grade ? ` • ${item.grade}` : ""}`}
              subtitle={item.qrCode ? `QR: ${item.qrCode}` : undefined}
              breed={item.breed ?? "-"}
              quantity={item.palletLocation ?? "-"}
              status={item.status ?? "-"}
              state={item.grade ?? "-"}
              href={`/inventory/${item.id}`}
              actionLabel="View Full Details"
              mobileSummary={getItemSummary(item)}
              desktopDetails={[
                { label: "Breed", value: item.breed ?? "-" },
                { label: "Grade", value: item.grade ?? "-" },
                { label: "Status", value: item.status ?? "-" },
                { label: "Pallet Location", value: item.palletLocation ?? "-" },
              ]}
              imgSrc={item.coverImage}
            />
            <Button type="button" variant="outline" className="w-full" onClick={resetScanner}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Scan Again
            </Button>
          </div>
        )}

        {(scanState === "not_found" || scanState === "error") && (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl bg-slate-50 px-6 text-center">
            <TriangleAlert className="h-10 w-10 text-slate-400" />
            <p className="mt-4 text-base font-semibold text-slate-900">
              {scanState === "not_found" ? "Item not found" : "Scanner unavailable"}
            </p>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <Button type="button" variant="outline" className="mt-6" onClick={resetScanner}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Scan Again
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
        <div className="flex items-start gap-3">
          <Camera className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Use your phone over HTTPS or localhost. Camera permission issues will show here instead of a blank screen.</p>
        </div>
      </div>
    </section>
  );
}
