"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/utils/AuthContext";
import { logOut } from "@/api/users";
import { useRouter } from "next/navigation";
import Calendar from "@/components/Dashboard/Calendar/calendar";
import { getDashboardMetrics, DashboardMetrics } from "@/api/dashboard";
import Graph from "@/components/Dashboard/Graph/graph";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DEFAULT_START = new Date("2026-02-11");
const DEFAULT_END = new Date("2026-03-11");

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatWeight(value: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} kg`;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: DEFAULT_START,
    to: DEFAULT_END,
  });
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    document.cookie = "session=; path=/; max-age=0";
    await logOut();
    router.push("/login");
  };

  const handleRangeChange = async (start: Date, end: Date) => {
    setCalendarOpen(false);
    setDateRange({ from: start, to: end });
  };

  useEffect(() => {
    let active = true;

    async function loadDashboardMetrics() {
      setLoading(true);

      try {
        const data = await getDashboardMetrics(dateRange.from, dateRange.to);

        if (active) {
          setMetrics(data);
        }
      } catch (error) {
        console.error("Failed to load dashboard metrics:", error);

        if (active) {
          setMetrics(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      void loadDashboardMetrics();
    }

    return () => {
      active = false;
    };
  }, [authLoading, dateRange]);

  const chartData = metrics?.weeklyData ?? [];

  const metricCards = [
    {
      title: "Gross Income",
      value: metrics ? formatCurrency(metrics.grossIncome) : "—",
      highlighted: true,
    },
    {
      title: "Profit",
      value: metrics ? formatCurrency(metrics.profit) : "—",
    },
    {
      title: "Wool Cost",
      value: metrics ? formatCurrency(metrics.totalCost) : "—",
    },
    {
      title: "Weight of Wool Sold",
      value: metrics ? formatWeight(metrics.weightOfWoolSold) : "—",
    },
    {
      title: "Inventory Cost",
      value: metrics ? formatCurrency(10400) : "—",
    },
  ];

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfaf4]">
        <p className="text-sm font-medium tracking-wide text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbfaf4_0%,#ffffff_34%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7f8030]">Dashboard</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Overview</h1>
            {user && <p className="max-w-2xl text-sm text-slate-600">Track sales performance and weekly gross income across the selected date range.</p>}
          </div>

          <div className="relative self-start">
            <button
              onClick={() => setCalendarOpen((prev) => !prev)}
              className="flex min-h-11 items-center gap-3 rounded-full border border-[#d2d1c3] bg-[#3a4f0d] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#314206]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="17" viewBox="0 0 15 17" fill="none">
                <path d="M4.38889 0.5V3.7M10.6111 0.5V3.7M0.5 6.9H14.5M2.05556 2.1H12.9444C13.8036 2.1 14.5 2.81634 14.5 3.7V14.9C14.5 15.7837 13.8036 16.5 12.9444 16.5H2.05556C1.19645 16.5 0.5 15.7837 0.5 14.9V3.7C0.5 2.81634 1.19645 2.1 2.05556 2.1Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{formatDateLabel(dateRange.from)} – {formatDateLabel(dateRange.to)}</span>
            </button>

            {calendarOpen && (
              <div className="absolute right-0 z-50 mt-3">
                <Calendar
                  onRangeChange={handleRangeChange}
                  onClose={() => setCalendarOpen(false)}
                  initialRange={dateRange}
                />
              </div>
            )}
          </div>
        </div>

        <section className="grid grid-cols-1 gap-px overflow-hidden rounded-[10px] border border-[#d4d4cb] bg-[#d4d4cb] shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:grid-cols-5">
          {metricCards.map((item) => (
            <Card key={item.title} className="rounded-none border-0 bg-white shadow-none">
              <CardHeader className={`gap-0 px-4 pb-2 pt-3 ${item.highlighted ? "border-t-4 border-t-[#7f8030]" : "border-t border-t-transparent"}`}>
                <CardDescription className="text-[13px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  {item.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <CardTitle className="text-[28px] font-bold tracking-tight text-slate-950 sm:text-[32px]">{item.value}</CardTitle>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="overflow-hidden rounded-[10px] border border-[#d4d4cb] shadow-none">
          <CardContent className="px-3 pb-4 pt-3 sm:px-4 sm:pb-6">
            <div className="flex items-center justify-between gap-3 px-2 pb-2 sm:px-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Gross Income by Week</p>
                <p className="text-sm text-slate-600">Weekly performance for the selected range.</p>
              </div>

              <button
                onClick={handleSignOut}
                className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-[#3a4f0d] transition hover:bg-[#f2f3ea]"
              >
                Sign Out
              </button>
            </div>

            <div className="relative h-[430px] w-full">
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                  <p className="text-sm font-medium text-slate-500">Loading metrics...</p>
                </div>
              )}

              <Graph data={chartData} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}