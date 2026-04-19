"use client";

import { useEffect, useRef, useState } from "react";

interface FilterButtonProps {
  label: string;
  active?: boolean;
  children: React.ReactNode;
  onApply: () => void;
  onCancel: () => void;
}

export default function FilterButton({
  label,
  active = false,
  children,
  onApply,
  onCancel,
}: FilterButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          height: "35px",
          padding: "10px",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px",
          borderRadius: "10px",
          border: "1px solid #686868",
          background: active ? "#e8e8e8" : "transparent",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M7 1V13M1 7H13"
            stroke="#000"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span
          style={{
            color: "#000",
            fontFamily: "var(--sds-typography-body-font-family, sans-serif)",
            fontSize: "var(--sds-typography-body-size-small, 14px)",
            fontStyle: "normal",
            fontWeight: "var(--sds-typography-body-font-weight-regular, 400)",
            lineHeight: "140%",
          }}
        >
          {label}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 50,
            display: "flex",
            width: "267px",
            padding: "15px 0",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "5px",
            borderRadius: "10px",
            background: "#FFF",
            boxShadow: "0 4px 4px 0 rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ width: "100%", padding: "0 15px" }}>{children}</div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              width: "100%",
              padding: "8px 15px 0",
              borderTop: "1px solid #f0f0f0",
              marginTop: "4px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                onCancel();
                setOpen(false);
              }}
              style={{
                height: "32px",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1px solid #686868",
                background: "transparent",
                cursor: "pointer",
                fontSize: "14px",
                color: "#000",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onApply();
                setOpen(false);
              }}
              style={{
                height: "32px",
                padding: "0 14px",
                borderRadius: "8px",
                border: "none",
                background: "#686868",
                color: "#fff",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}