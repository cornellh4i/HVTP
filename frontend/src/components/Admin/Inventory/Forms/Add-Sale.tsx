"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { addSale, SaleInput } from "@/api/sales";
import EditableField from "@/components/ui/EditableField";

interface SaleModalProps {
  itemId: string;
  costPerWeight: number; // intake price $/lb
  onClose: () => void;
  onSaleRecorded?: (saleId: string, totalPrice: number) => void;
}

export default function SaleModal({
  itemId,
  costPerWeight,
  onClose,
  onSaleRecorded,
}: SaleModalProps) {
  const [weightSold, setWeightSold] = useState("");
  const [pricePerWeight, setPricePerWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag state
  const modalRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({
    dragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag from the header, not inputs
    if ((e.target as HTMLElement).closest("input, button, label")) return;
    const rect = modalRef.current!.getBoundingClientRect();
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
    };
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragState.current.dragging) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      setPos({
        x: dragState.current.origX + dx,
        y: dragState.current.origY + dy,
      });
    };
    const onMouseUp = () => {
      dragState.current.dragging = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const totalPrice =
    weightSold && pricePerWeight
      ? (parseFloat(weightSold) * parseFloat(pricePerWeight)).toFixed(2)
      : null;

  const handleSubmit = async () => {
    if (!weightSold || !pricePerWeight || !buyerName) {
    setError("Quantity, price, and customer name are required.");
    return;
  }
    setError(null);
    setSaving(true);
    try {
     const payload: SaleInput = {
      itemId,
      weightSold: parseFloat(weightSold),
      weightUnit: "lb",
      pricePerWeight: parseFloat(pricePerWeight),
      totalPrice: parseFloat(totalPrice!),
      costPerWeight: Number(costPerWeight),
      soldAt: new Date().toISOString(),
      buyerName,
      buyerPhone: buyerPhone.trim() || undefined,
      buyerEmail: buyerEmail.trim() || undefined,
      buyerAddress: buyerAddress.trim() || undefined,
      notes: notes?.trim() || "",
    };
      console.log("SALE PAYLOAD:", payload);
      const result = await addSale(payload);
      onSaleRecorded?.(result.id, result.totalPrice);
      onClose();
    } catch (err) {
      console.error("addSale error:", err);
      setError(err instanceof Error ? err.message : "Failed to record sale.");
    } finally {
      setSaving(false);
    }
  };

  // Keyboard close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const modalStyle: React.CSSProperties = pos
    ? {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        transform: "none",
        margin: 0,
      }
    : {};

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal */}
      <div
        ref={modalRef}
        style={modalStyle}
        className="relative bg-white rounded-xl shadow-2xl w-[560px] max-w-[95vw] select-none"
      >
        {/* Draggable header */}
        <div
          className="flex items-center justify-between px-6 pt-6 pb-2 cursor-move"
          onMouseDown={onMouseDown}
        >
          <h2 className="text-2xl font-bold text-gray-900">Record a Sale</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-4 flex flex-col gap-6">
          {/* Sale Details */}
          <div className="rounded-xl border border-gray-200 p-4 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-gray-900">Sale Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-600">
                  Quantity Sold (lbs)<span className="text-red-500">*</span>
                </label>
                <EditableField
                  isEditing
                  value={weightSold}
                  placeholder="Weight"
                  onChange={setWeightSold}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-600">
                  Sale Price ($/lb)<span className="text-red-500">*</span>
                </label>
                <EditableField
                  isEditing
                  value={pricePerWeight}
                  placeholder="Price"
                  onChange={setPricePerWeight}
                />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-600">Lot Revenue</span>
              <span className="text-sm font-semibold text-gray-900">
                {totalPrice ? `$${totalPrice}` : "—"}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-semibold text-gray-900">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-600">
                  Name<span className="text-red-500">*</span>
                </label>
                <EditableField
                  isEditing
                  value={buyerName}
                  placeholder="Full name"
                  onChange={setBuyerName}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-600">Phone Number</label>
                <EditableField
                  isEditing
                  value={buyerPhone}
                  placeholder="555-000-0000"
                  onChange={setBuyerPhone}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-600">Email</label>
              <EditableField
                isEditing
                value={buyerEmail}
                placeholder="email@example.com"
                onChange={setBuyerEmail}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-600">Address</label>
              <textarea
                value={buyerAddress}
                placeholder="Street, City, State ZIP"
                onChange={(e) => setBuyerAddress(e.target.value)}
                className="w-full min-h-[80px] resize-y border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-lg bg-[#4a5c2f] hover:bg-[#3a4a24] text-white px-5 py-2 text-sm font-medium disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving ? "Recording..." : "Record Sale"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
