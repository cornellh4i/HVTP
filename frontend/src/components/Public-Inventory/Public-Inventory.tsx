"use client";

import { useEffect, useState } from "react";
import { getPublicItems, type Item } from "@/api/items";
import CardTable from "./Card-Table";
import SheetTable from "./Sheet-Table";
import FilterButton from "./Filter";

// ─── Date sort button ─────────────────────────────────────────────────────────
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
const STATUS_OPTIONS = ["Processing", "On Hold", "Available", "Out of Stock"];
const WOOL_TYPE_OPTIONS = ["Grease Wool", "Scoured Wool", "Carded Wool"];
const GRADE_OPTIONS = ["Fine", "Medium", "Premium Long", "Rug"];
const COLOR_OPTIONS = ["White", "Natural Color"];

// ─── Filter state ──────────────────────────────────────────────────────────────
interface Filters {
  status: string | null;
  woolTypes: string[];
  breed: string;
  grade: string | null;
  colors: string[];
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function PublicInventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"card" | "sheet">("card");
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Committed filters
  const [filters, setFilters] = useState<Filters>({
    status: null,
    woolTypes: [],
    breed: "",
    grade: null,
    colors: [],
  });

  // Pending (inside popup, not yet applied)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [pendingWoolTypes, setPendingWoolTypes] = useState<string[]>([]);
  const [pendingBreed, setPendingBreed] = useState<string>("");
  const [pendingGrade, setPendingGrade] = useState<string | null>(null);
  const [pendingColors, setPendingColors] = useState<string[]>([]);

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

      if (filters.status && (item.status ?? "").toLowerCase() !== filters.status.toLowerCase())
        return false;

      if (
        filters.woolTypes.length > 0 &&
        !filters.woolTypes.some(
          (w) => w.toLowerCase() === (item.breed ?? "").toLowerCase()
        )
      )
        return false;

      if (
        filters.breed &&
        !(item.breed ?? "").toLowerCase().includes(filters.breed.toLowerCase())
      )
        return false;

      if (filters.grade && (item.grade ?? "").toLowerCase() !== filters.grade.toLowerCase())
        return false;

      if (
        filters.colors.length > 0 &&
        !filters.colors.some(
          (c) => c.toLowerCase() === (item.color ?? "").toLowerCase()
        )
      )
        return false;

      return true;
    })
    .sort((a, b) => {
      const sa = a.sku ?? "";
      const sb = b.sku ?? "";
      return sortDir === "desc" ? sb.localeCompare(sa) : sa.localeCompare(sb);
    });

  const totalWeight = filteredItems.reduce(
    (sum, i) => sum + (parseFloat(String(i.weight ?? 0)) || 0),
    0
  );

  const anyActive =
    !!filters.status ||
    filters.woolTypes.length > 0 ||
    !!filters.breed ||
    !!filters.grade ||
    filters.colors.length > 0;

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

            {/* Status */}
            <FilterButton
              label="Status"
              active={!!filters.status}
              onApply={() => setFilters((f) => ({ ...f, status: pendingStatus }))}
              onCancel={() => setPendingStatus(filters.status)}
            >
              <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "#000" }}>
                Status
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {STATUS_OPTIONS.map((s) => (
                  <CheckboxOption
                    key={s}
                    label={s}
                    checked={pendingStatus === s}
                    onChange={() => setPendingStatus(pendingStatus === s ? null : s)}
                  />
                ))}
              </div>
            </FilterButton>

            {/* Wool Type */}
            <FilterButton
              label="Wool Type"
              active={filters.woolTypes.length > 0}
              onApply={() => setFilters((f) => ({ ...f, woolTypes: pendingWoolTypes }))}
              onCancel={() => setPendingWoolTypes(filters.woolTypes)}
            >
              <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "#000" }}>
                Wool Type
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {WOOL_TYPE_OPTIONS.map((w) => (
                  <CheckboxOption
                    key={w}
                    label={w}
                    checked={pendingWoolTypes.includes(w)}
                    onChange={() =>
                      setPendingWoolTypes((prev) =>
                        prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]
                      )
                    }
                  />
                ))}
              </div>
            </FilterButton>

            {/* Breed */}
            <FilterButton
              label="Breed"
              active={!!filters.breed}
              onApply={() => setFilters((f) => ({ ...f, breed: pendingBreed }))}
              onCancel={() => setPendingBreed(filters.breed)}
            >
              <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "#000" }}>
                Breed
              </p>
              <div style={{ position: "relative" }}>
                <svg
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                  width="14"
                  height="14"
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
                <input
                  type="text"
                  placeholder="Search breed..."
                  value={pendingBreed}
                  onChange={(e) => setPendingBreed(e.target.value)}
                  style={{
                    width: "100%",
                    height: "36px",
                    padding: "0 12px 0 32px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
            </FilterButton>

            {/* Grade */}
            <FilterButton
              label="Grade"
              active={!!filters.grade}
              onApply={() => setFilters((f) => ({ ...f, grade: pendingGrade }))}
              onCancel={() => setPendingGrade(filters.grade)}
            >
              <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "#000" }}>
                Grade
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {GRADE_OPTIONS.map((g) => (
                  <CheckboxOption
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
              active={filters.colors.length > 0}
              onApply={() => setFilters((f) => ({ ...f, colors: pendingColors }))}
              onCancel={() => setPendingColors(filters.colors)}
            >
              <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "#000" }}>
                Color
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

            {anyActive && (
              <button
                type="button"
                onClick={() =>
                  setFilters({ status: null, woolTypes: [], breed: "", grade: null, colors: [] })
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

          {/* Totals */}
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