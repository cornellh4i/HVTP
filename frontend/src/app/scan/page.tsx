"use client";

import dynamic from "next/dynamic";

const QrScanner = dynamic(
  () => import("@/components/Admin/Inventory/QrScanner/QrScanner"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Loading scanner...
      </div>
    ),
  }
);

export default function ScanPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-28 pt-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-md md:max-w-2xl">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold text-slate-900">Scan QR Code</h1>
          <p className="mt-1 text-sm text-slate-500">
            Scan a wool item label to open its inventory details.
          </p>
        </div>
        <QrScanner />
      </div>
    </main>
  );
}
