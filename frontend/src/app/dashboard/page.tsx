"use client";
import { useState } from "react";
import { useAuth } from "@/utils/AuthContext";
import { logOut } from "@/api/users";
import { useRouter } from "next/navigation";
import Calendar from "@/components/Dashboard/Calendar/calendar";
import { getDashboardMetrics, DashboardMetrics } from "@/api/dashboard";

const DEFAULT_START = new Date("2026-02-11");
const DEFAULT_END = new Date("2026-03-11");

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(DEFAULT_START);
  const [endDate, setEndDate] = useState<Date>(DEFAULT_END);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const handleSignOut = async () => {
    document.cookie = "session=; path=/; max-age=0";
    await logOut();
    router.push("/login");
  };

  const handleRangeChange = async (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    const data = await getDashboardMetrics(start, end);
    setMetrics(data);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="relative">
          <button
            onClick={() => setCalendarOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: "#3A4F00" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="17" viewBox="0 0 15 17" fill="none">
              <path d="M4.38889 0.5V3.7M10.6111 0.5V3.7M0.5 6.9H14.5M2.05556 2.1H12.9444C13.8036 2.1 14.5 2.81634 14.5 3.7V14.9C14.5 15.7837 13.8036 16.5 12.9444 16.5H2.05556C1.19645 16.5 0.5 15.7837 0.5 14.9V3.7C0.5 2.81634 1.19645 2.1 2.05556 2.1Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{formatDateLabel(startDate)} – {formatDateLabel(endDate)}</span>
          </button>

          {calendarOpen && (
            <div className="absolute right-0 z-50 mt-2">
              <Calendar
                onRangeChange={handleRangeChange}
                onClose={() => setCalendarOpen(false)}
                initialRange={{ from: startDate, to: endDate }}
              />
            </div>
          )}
        </div>
      </div>

      {user && <p className="text-gray-600 mt-2">An overview of income, revenue, and tasks.</p>}

      <button
        onClick={handleSignOut}
        className="mt-4 w-fit rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}