"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/utils/AuthContext";
import { logOut } from "@/api/users";
import { useRouter } from "next/navigation";
import Calendar from "@/components/Dashboard/Calendar/calendar";
import { getDashboardMetrics, DashboardMetrics } from "@/api/dashboard";
import Graph from "@/components/Dashboard/Graph/graph";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const taskIconEmpty = "https://www.figma.com/api/mcp/asset/200f9e41-1e8c-43c7-81ed-51961d41f553";
const taskIconChecked = "https://www.figma.com/api/mcp/asset/e5d0e84b-48df-4f46-84b3-1dfdc5d3b42f";

const DEFAULT_START = new Date("2026-02-11");
const DEFAULT_END = new Date("2026-03-11");

const MAX_BARS = 12;

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

type MetricKey = "grossIncome" | "profit" | "totalCost" | "weightOfWoolSold" | "inventoryCost";

const INVENTORY_COST = 10400;

function getMetricTitle(metric: MetricKey): string {
  if (metric === "grossIncome") return "Gross Income";
  if (metric === "profit") return "Profit";
  if (metric === "totalCost") return "Wool Cost";
  if (metric === "weightOfWoolSold") return "Weight of Wool Sold";
  return "Inventory Cost";
}

const initialTasks = [
  {
    date: "Mar. 10",
    lot: "Lot #39",
    suffix: " has reached 3 months since intake.",
    completed: false,
  },
  {
    date: "Mar. 11",
    lot: "Lot #29",
    suffix: " has reached 3 months since intake.",
    completed: true,
  },
  {
    date: "Mar. 12",
    lot: "Lot #34",
    suffix: " has reached 3 months since intake.",
    completed: false,
  },
  {
    date: "Mar. 12",
    lot: "Lot #42",
    suffix: " has reached 3 months since intake.",
    completed: false,
  },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: DEFAULT_START,
    to: DEFAULT_END,
  });
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("grossIncome");
  const [activeTaskTab, setActiveTaskTab] = useState<"tasks" | "upcoming">("tasks");
  const [tasks, setTasks] = useState(initialTasks);

  const handleSignOut = async () => {
    document.cookie = "session=; path=/; max-age=0";
    await logOut();
    router.push("/login");
  };

  // isQuickAction=true means a preset was used → don't show "Custom"
  const handleRangeChange = async (start: Date, end: Date, isQuickAction = false) => {
    setCalendarOpen(false);
    setDateRange({ from: start, to: end });
    setIsCustomRange(!isQuickAction);
  };

  const handleToggleTask = (taskIndex: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task, index) =>
        index === taskIndex ? { ...task, completed: !task.completed } : task
      )
    );
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

  const barCount = (metrics?.weeklyData ?? []).length;
  const tooManyBars = barCount > MAX_BARS;

  const chartData = (metrics?.weeklyData ?? []).map((bucket) => {
    const gross = bucket.grossIncome;
    const grossTotal = metrics?.grossIncome ?? 0;
    const ratio = grossTotal > 0 ? gross / grossTotal : 0;

    if (activeMetric === "profit") {
      return { label: bucket.label, value: (metrics?.profit ?? 0) * ratio };
    }

    if (activeMetric === "totalCost") {
      return { label: bucket.label, value: (metrics?.totalCost ?? 0) * ratio };
    }

    if (activeMetric === "weightOfWoolSold") {
      return { label: bucket.label, value: (metrics?.weightOfWoolSold ?? 0) * ratio };
    }

    if (activeMetric === "inventoryCost") {
      const bucketCount = Math.max((metrics?.weeklyData ?? []).length, 1);
      return { label: bucket.label, value: INVENTORY_COST / bucketCount };
    }

    return { label: bucket.label, value: gross };
  });

  const metricCards = [
    {
      key: "grossIncome" as const,
      title: "Gross Income",
      value: metrics ? formatCurrency(metrics.grossIncome) : "—",
    },
    {
      key: "profit" as const,
      title: "Profit",
      value: metrics ? formatCurrency(metrics.profit) : "—",
    },
    {
      key: "totalCost" as const,
      title: "Wool Cost",
      value: metrics ? formatCurrency(metrics.totalCost) : "—",
    },
    {
      key: "weightOfWoolSold" as const,
      title: "Weight of Wool Sold",
      value: metrics ? formatWeight(metrics.weightOfWoolSold) : "—",
    },
    {
      key: "inventoryCost" as const,
      title: "Inventory Cost",
      value: metrics ? formatCurrency(INVENTORY_COST) : "—",
    },
  ];

  const graphLabelFormatter = (value: number): string => {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
  };

  const visibleTasks = activeTaskTab === "tasks" ? tasks : tasks.filter((task) => !task.completed);

  const visibleTasksWithIndex = visibleTasks.map((task) => ({
    ...task,
    originalIndex: tasks.findIndex((t) => t.date === task.date && t.lot === task.lot && t.suffix === task.suffix),
  }));

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
        <div className="flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="flex flex-col gap-3">
            <h1
              className="text-[32px] font-bold leading-[1.2] text-black"
              style={{ fontFamily: "Acumin Pro, sans-serif" }}
            >
              Dashboard
            </h1>
            <p
              className="text-[20px] font-normal leading-none text-[rgba(0,0,0,0.8)]"
              style={{ fontFamily: "Acumin Pro, sans-serif" }}
            >
              An overview of storage, revenue, and tasks.
            </p>
          </div>

          <div className="relative self-start">
            <button
              onClick={() => setCalendarOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-[6px] bg-[#3a4f0d] px-4 py-2.5 text-[14px] font-light leading-[1.4] text-white transition hover:bg-[#314206]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 14 16" fill="none">
                <path d="M4.08333 0.5V3.5M9.91667 0.5V3.5M0.5 6.5H13.5M2 2H12C12.8036 2 13.5 2.67645 13.5 3.5V13.5C13.5 14.3236 12.8036 15 12 15H2C1.19645 15 0.5 14.3236 0.5 13.5V3.5C0.5 2.67645 1.19645 2 2 2Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {/* Show "Custom" when user manually picks a range */}
              <span>
                {isCustomRange
                  ? "Custom"
                  : `${formatDateLabel(dateRange.from)} - ${formatDateLabel(dateRange.to)}`}
              </span>
            </button>

            {calendarOpen && (
              <div className="absolute right-0 z-50 mt-2">
                <Calendar
                  onRangeChange={handleRangeChange}
                  onClose={() => setCalendarOpen(false)}
                  initialRange={dateRange}
                />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[8px] border border-[rgba(0,0,0,0.2)] bg-white p-[12px]">
          <div className="flex flex-col gap-5">
            <div className="flex items-start">
              <div className="flex h-[34px] items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTaskTab("tasks")}
                  className={`flex items-center justify-center border-t-4 px-1.5 py-2 ${activeTaskTab === "tasks" ? "border-b-2 border-black border-t-transparent" : "border-b-2 border-transparent border-t-transparent"}`}
                >
                  <p className={`whitespace-nowrap text-[16px] leading-normal ${activeTaskTab === "tasks" ? "font-bold text-black" : "font-normal text-[rgba(0,0,0,0.6)]"}`} style={{ fontFamily: "Acumin Pro, sans-serif" }}>
                    Tasks
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTaskTab("upcoming")}
                  className={`flex items-center justify-center border-t-4 px-1.5 py-2 ${activeTaskTab === "upcoming" ? "border-b-2 border-black border-t-transparent" : "border-b-2 border-transparent border-t-transparent"}`}
                >
                  <p className={`whitespace-nowrap text-[16px] leading-normal ${activeTaskTab === "upcoming" ? "font-bold text-black" : "font-normal text-[rgba(0,0,0,0.6)]"}`} style={{ fontFamily: "Acumin Pro, sans-serif" }}>
                    Upcoming
                  </p>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {visibleTasksWithIndex.map(({ date, lot, suffix, completed, originalIndex }, index) => {
                const icon = completed ? taskIconChecked : taskIconEmpty;
                const dateClass = completed ? "text-[rgba(0,0,0,0.5)]" : "text-black";
                const textClass = completed ? "[text-decoration-skip-ink:none] decoration-solid line-through text-black" : "text-black";

                return (
                  <div
                    key={`${date}-${lot}-${index}`}
                    onClick={() => handleToggleTask(originalIndex)}
                    className="flex cursor-pointer items-center justify-between gap-4 rounded-md px-2 py-1.5 transition hover:bg-[rgba(0,0,0,0.02)]"
                  >
                    <div className="flex items-center gap-[24px]">
                      <div className="relative size-[24px] shrink-0 overflow-clip">
                        <div className="absolute inset-[12.5%_12.5%_0.78%_12.5%]">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={icon} />
                        </div>
                      </div>
                      <p className={`whitespace-nowrap text-[15px] font-normal leading-normal ${dateClass}`} style={{ fontFamily: "Acumin Pro, sans-serif" }}>
                        {date}
                      </p>
                    </div>

                    <p className={`whitespace-nowrap text-[15px] font-normal leading-normal ${textClass}`} style={{ fontFamily: "Acumin Pro, sans-serif" }}>
                      <span className="[text-decoration-skip-ink:none] decoration-solid underline">{lot}</span>
                      <span>{suffix}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[8px] border border-[rgba(0,0,0,0.2)] bg-white shadow-none">
          <section className="grid grid-cols-1 gap-px bg-[rgba(0,0,0,0.2)] lg:grid-cols-5">
            {metricCards.map((item) => {
              // Disable metric card selection when bar count exceeds MAX_BARS
              const isDisabled = tooManyBars;
              const isActive = activeMetric === item.key;

              return (
                <Card
                  key={item.title}
                  className={`relative overflow-hidden rounded-none border-0 bg-white shadow-none transition ${
                    isDisabled
                      ? "cursor-not-allowed opacity-50"
                      : isActive
                          ? "z-10 cursor-default -mb-px border-b border-b-white hover:bg-white hover:shadow-none"
                        : "group cursor-pointer border-b border-b-[rgba(0,0,0,0.2)] hover:bg-[#fafaf7]"
                  }`}
                  onClick={() => {
                    if (!isDisabled) setActiveMetric(item.key);
                  }}
                >
                  {!isActive && !isDisabled && (
                    <div className="absolute left-0 top-0 h-1 w-full bg-[#7f8030] opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                  {isActive && !isDisabled && (
                    <div className="absolute left-0 top-0 h-1 w-full bg-[#7f8030]" />
                  )}
                  <CardHeader
                    className="gap-0 px-3 pb-1 pt-4"
                  >
                    <CardDescription
                      className="whitespace-nowrap uppercase text-[14px] font-normal leading-normal text-[rgba(0,0,0,0.6)]"
                      style={{ fontFamily: "Acumin Pro, sans-serif" }}
                    >
                      {item.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 pb-4 pt-0">
                    <CardTitle className="text-[28px] font-bold tracking-tight text-slate-950 sm:text-[32px]">
                      {item.value}
                    </CardTitle>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <Card className="-mt-px rounded-none border-0 shadow-none">
            <CardContent className="px-3 pb-4 pt-3 sm:px-3 sm:pb-4">
              <div className="relative h-[430px] w-full">
                {loading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                    <p className="text-sm font-medium text-slate-500">Loading metrics...</p>
                  </div>
                )}

                <Graph data={chartData} barLabelFormatter={graphLabelFormatter} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}