"use client";

import { useRef, useState } from "react";
import SearchBar from "@/components/searchBar";
import Dropdown from "@/components/dropdown";

export default function SuccessPage() {
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Success</h1>

      {/* Testing SearchBar */}
      <SearchBar
        ref={searchRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Testing Dropdown */}
      <div className="w-4/5">
        <Dropdown name="Color">
          <label className="flex items-center gap-2 py-1 text-sm">
            <input type="checkbox" /> White
          </label>
          <label className="flex items-center gap-2 py-1 text-sm">
            <input type="checkbox" /> Natural Color
          </label>
        </Dropdown>

        <Dropdown name="Grade">
          <label className="flex items-center gap-2 py-1 text-sm">
            <input type="checkbox" /> Premium Long
          </label>
        </Dropdown>
      </div>
    </main>
  );
}
