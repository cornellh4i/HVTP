"use client";

import { useEffect, useState } from "react";
import { getPublicItems, type Item } from "@/api/items";
import CardTable from "./Card-Table";
import SheetTable from "./Sheet-Table";
import FilterButton from "./Filter";

// ─── Date sort button (dark #686868 pill) ─────────────────────────────────────
function DateSortButton({
  direction,
  onToggle,
}: {
  direction: "asc" | "desc";
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: "flex",
        height: "35px",
        padding: "10px",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        borderRadius: "10px",
        border: "1px solid #686868",
        background: "#686868",
        color: "#fff",
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontSize: "14px",
        fontWeight: 400,
      }}
    >
      Date Added
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: direction === "asc" ? "rotate(180deg)" : "none",
          transition: "transform 0.2s",
        }}
      >
        <path
          d="M2 4L6 8L10 4"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

// ─── Radio option (single-select) ─────────────────────────────────────────────
function RadioOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        fontSize: "14px",
        color: "#000",
        lineHeight: "140%",
        padding: "4px 0",
        width: "100%",
        userSelect: "none",
      }}
    >
      <span
        onClick={onChange}
        style={{
          display: "inline-flex",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          border: `2px solid ${checked ? "#686868" : "#ccc"}`,
          background: checked ? "#686868" : "transparent",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {checked && (
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#fff",
            }}
          />
        )}
      </span>
      <span onClick={onChange}>{label}</span>
    </label>
  );
}

// ─── Checkbox option (multi-select) ───────────────────────────────────────────
function CheckboxOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        fontSize: "14px",
        color: "#000",
        lineHeight: "140%",
        padding: "4px 0",
        width: "100%",
        userSelect: "none",
      }}
    >
      <span
        onClick={onChange}
        style={{
          display: "inline-flex",
          width: "18px",
          height: "18px",
          borderRadius: "4px",
          border: `2px solid ${checked ? "#686868" : "#ccc"}`,
          background: checked ? "#686868" : "transparent",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span onClick={onChange}>{label}</span>
    </label>
  );
}

// ─── Static option lists ───────────────────────────────────────────────────────
const GRADE_OPTIONS = ["A", "B", "C", "D"];
const COLOR_OPTIONS = ["Natural", "White", "Black", "Brown", "Grey"];
const STATE_OPTIONS = ["Raw", "Washed", "Scoured", "Processed"];
const STATUS_OPTIONS = ["Available", "Reserved", "Sold"];

// ─── Filter state ──────────────────────────────────────────────────────────────
interface Filters {
  grade: string | null;  // → Item.grade
  colors: string[];      // → Item.color (multi-select)
  state: string | null;  // → Item.status (processing state values)
  status: string | null; // → Item.status (availability values)
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function PublicInventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"card" | "sheet">("card");
  const [search, setSearch] = useState("");
  // No createdAt on Item — sort by sku (lexicographic) as a stable fallback
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Committed filters
  const [filters, setFilters] = useState<Filters>({
    grade: null,
    colors: [],
    state: null,
    status: null,
  });

  // Pending (inside popup, not yet applied)
  const [pendingGrade, setPendingGrade] = useState<string | null>(null);
  const [pendingColors, setPendingColors] = useState<string[]>([]);
  const [pendingState, setPendingState] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getPublicItems();
        if (active) setItems(data);
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : "Failed to load inventory");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // ── Filtering + sorting ─────────────────────────────────────────────────────
  const filteredItems = items
    .filter((item) => {
      // Search across sku, breed, grade, color, status, farmerName, farmerCity, farmerState
      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = [
          item.sku,
          item.breed,
          item.grade,
          item.color,
          item.status,
          item.farmerName,
          item.farmerCity,
          item.farmerState,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // Grade — Item.grade
      if (filters.grade && item.grade !== filters.grade) return false;

      // Color — Item.color
      if (
        filters.colors.length > 0 &&
        !filters.colors.some(
          (c) => c.toLowerCase() === (item.color ?? "").toLowerCase()
        )
      )
        return false;

      // State — Item.status (processing state: Raw, Washed, Scoured…)
      // NOTE: if you add a dedicated `state` field to Item, swap item.status → item.state here
      if (
        filters.state &&
        (item.status ?? "").toLowerCase() !== filters.state.toLowerCase()
      )
        return false;

      // Status — Item.status (availability: Available, Reserved, Sold)
      if (
        filters.status &&
        (item.status ?? "").toLowerCase() !== filters.status.toLowerCase()
      )
        return false;

      return true;
    })
    .sort((a, b) => {
      // No createdAt — sort by sku string as a stable proxy
      const sa = a.sku ?? "";
      const sb = b.sku ?? "";
      return sortDir === "desc"
        ? sb.localeCompare(sa)
        : sa.localeCompare(sb);
    });

  // Total weight — Item.weight may be number | string
  const totalWeight = filteredItems.reduce(
    (sum, i) => sum + (parseFloat(String(i.weight ?? 0)) || 0),
    0
  );

  const gradeActive = !!filters.grade;
  const colorsActive = filters.colors.length > 0;
  const stateActive = !!filters.state;
  const statusActive = !!filters.status;
  const anyActive = gradeActive || colorsActive || stateActive || statusActive;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto w-full max-w-[1273px]">

        {/* ── Title + view toggle ─────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Inventory</h1>

          <div className="flex h-8 w-[124px] items-stretch overflow-hidden rounded-[10px] border border-slate-500 bg-white">
            <button
              type="button"
              onClick={() => setMode("card")}
              className={`flex h-full flex-1 items-center justify-center border-r border-slate-300 transition-colors ${
                mode === "card"
                  ? "bg-[#646D72] text-white"
                  : "bg-white text-[#646D72] hover:bg-slate-50"
              }`}
              aria-label="Card view"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2.5V17.5M2.5 10H17.5M4.16667 2.5H15.8333C16.7538 2.5 17.5 3.24619 17.5 4.16667V15.8333C17.5 16.7538 16.7538 17.5 15.8333 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V4.16667C2.5 3.24619 3.24619 2.5 4.16667 2.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setMode("sheet")}
              className={`flex h-full flex-1 items-center justify-center transition-colors ${
                mode === "sheet"
                  ? "bg-[#646D72] text-white"
                  : "bg-white text-[#646D72] hover:bg-slate-50"
              }`}
              aria-label="Sheet view"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path
                  d="M13.3333 4.16663H2.5M13.3333 9.99996H2.5M13.3333 15.8333H2.5M17.5 4.16663H17.5083M17.5 9.99996H17.5083M17.5 15.8333H17.5083"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Search + filter column ──────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            padding: "0 0 50px 0",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "25px",
          }}
        >
          {/* Search bar */}
          <div style={{ position: "relative", width: "100%", maxWidth: "480px" }}>
            <input
              type="text"
              placeholder="search for item"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                height: "40px",
                padding: "0 40px 0 16px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                background: "#fff",
                fontSize: "14px",
                color: "#000",
                outline: "none",
              }}
            />
            <svg
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
                stroke="#888"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Filter row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "25px",
              alignSelf: "stretch",
              flexWrap: "wrap",
            }}
          >
            <DateSortButton
              direction={sortDir}
              onToggle={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            />

            {/* Grade */}
            <FilterButton
              label="Grade"
              active={gradeActive}
              onApply={() => setFilters((f) => ({ ...f, grade: pendingGrade }))}
              onCancel={() => setPendingGrade(filters.grade)}
            >
              <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "#000" }}>
                Grade
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
                {GRADE_OPTIONS.map((g) => (
                  <RadioOption
                    key={g}
                    label={g}
                    checked={pendingGrade === g}
                    onChange={() => setPendingGrade(pendingGrade === g ? null : g)}
                  />
                ))}
              </div>
            </FilterButton>

            {/* Color */}
            <FilterButton
              label="Color"
              active={colorsActive}
              onApply={() => setFilters((f) => ({ ...f, colors: pendingColors }))}
              onCancel={() => setPendingColors(filters.colors)}
            >
              <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "#000" }}>
                Colors
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {COLOR_OPTIONS.map((c) => (
                  <CheckboxOption
                    key={c}
                    label={c}
                    checked={pendingColors.includes(c)}
                    onChange={() =>
                      setPendingColors((prev) =>
                        prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                      )
                    }
                  />
                ))}
              </div>
            </FilterButton>

            {/* State */}
            <FilterButton
              label="State"
              active={stateActive}
              onApply={() => setFilters((f) => ({ ...f, state: pendingState }))}
              onCancel={() => setPendingState(filters.state)}
            >
              <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "#000" }}>
                State
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {STATE_OPTIONS.map((s) => (
                  <RadioOption
                    key={s}
                    label={s}
                    checked={pendingState === s}
                    onChange={() => setPendingState(pendingState === s ? null : s)}
                  />
                ))}
              </div>
            </FilterButton>

            {/* Status */}
            <FilterButton
              label="Status"
              active={statusActive}
              onApply={() => setFilters((f) => ({ ...f, status: pendingStatus }))}
              onCancel={() => setPendingStatus(filters.status)}
            >
              <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "#000" }}>
                Status
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {STATUS_OPTIONS.map((s) => (
                  <RadioOption
                    key={s}
                    label={s}
                    checked={pendingStatus === s}
                    onChange={() => setPendingStatus(pendingStatus === s ? null : s)}
                  />
                ))}
              </div>
            </FilterButton>

            {anyActive && (
              <button
                type="button"
                onClick={() =>
                  setFilters({ grade: null, colors: [], state: null, status: null })
                }
                style={{
                  height: "35px",
                  padding: "0 12px",
                  borderRadius: "10px",
                  border: "1px solid #e00",
                  background: "transparent",
                  color: "#e00",
                  cursor: "pointer",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Totals — weight parsed from number | string */}
          <p style={{ fontSize: "14px", color: "#555" }}>
            Total Lots: {filteredItems.length}&nbsp;&nbsp;
            Total lbs: {totalWeight.toLocaleString()} lbs
          </p>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────────── */}
        {loading && <p className="text-gray-500">Loading…</p>}
        {!loading && error && <p className="text-red-600">{error}</p>}
        {!loading && !error && filteredItems.length === 0 && (
          <p className="text-gray-500">No items match your filters.</p>
        )}
        {!loading && !error && filteredItems.length > 0 && (
          <>
            {mode === "card" ? (
              <CardTable items={filteredItems} />
            ) : (
              <SheetTable items={filteredItems} />
            )}
          </>
        )}
      </div>
    </main>
  );
}