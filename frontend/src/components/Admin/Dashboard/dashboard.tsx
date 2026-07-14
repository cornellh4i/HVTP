"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/utils/AuthContext";
import { logOut } from "@/api/users";
import { useRouter } from "next/navigation";
import Calendar from "./Calendar/calendar";
import { getDashboardMetrics, DashboardMetrics } from "@/api/dashboard";
import Graph from "./Graph/graph";
import { exportChartAsPng } from "./exportChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import styles from "./dashboard.module.css";

const taskIconEmpty = "https://www.figma.com/api/mcp/asset/200f9e41-1e8c-43c7-81ed-51961d41f553";
const taskIconChecked = "https://www.figma.com/api/mcp/asset/e5d0e84b-48df-4f46-84b3-1dfdc5d3b42f";

function defaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return { from: start, to: end };
}

const MAX_BARS = 12;

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatWeight(value: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} lbs`;
}

type MetricKey = "grossIncome" | "profit" | "woolCost" | "weightOfWoolSold" | "inventoryCost";

function getMetricTitle(metric: MetricKey): string {
  if (metric === "grossIncome") return "Gross Income";
  if (metric === "profit") return "Profit";
  if (metric === "woolCost") return "Wool Cost";
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

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(defaultDateRange);
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("grossIncome");
  const [activeTaskTab, setActiveTaskTab] = useState<"tasks" | "upcoming">("tasks");
  const [tasks, setTasks] = useState(initialTasks);
  const chartExportRef = useRef<HTMLDivElement>(null);

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
    if (activeMetric === "profit")          return { label: bucket.label, value: bucket.profit };
    if (activeMetric === "woolCost")        return { label: bucket.label, value: bucket.woolCost };
    if (activeMetric === "weightOfWoolSold") return { label: bucket.label, value: bucket.weightSold };
    if (activeMetric === "inventoryCost") {
      const bucketCount = Math.max((metrics?.weeklyData ?? []).length, 1);
      return { label: bucket.label, value: (metrics?.inventoryCost ?? 0) / bucketCount };
    }
    return { label: bucket.label, value: bucket.grossIncome };
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
      key: "woolCost" as const,
      title: "Wool Cost",
      value: metrics ? formatCurrency(metrics.woolCost) : "—",
    },
    {
      key: "weightOfWoolSold" as const,
      title: "Weight of Wool Sold",
      value: metrics ? formatWeight(metrics.weightOfWoolSold) : "—",
    },
    {
      key: "inventoryCost" as const,
      title: "Inventory Cost",
      value: metrics ? formatCurrency(metrics.inventoryCost) : "—",
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

  const canExport = !loading && metrics !== null && chartData.length > 0;

  const handleExport = async () => {
    if (!chartExportRef.current || !canExport) {
      return;
    }

    const metricTitle = getMetricTitle(activeMetric).replace(/\s+/g, "_");
    const startDate = formatDateForFilename(dateRange.from);
    const endDate = formatDateForFilename(dateRange.to);
    const fileName = `dashboard_${metricTitle}_${startDate}_${endDate}.png`;

    try {
      await exportChartAsPng(chartExportRef.current, fileName);
    } catch (error) {
      console.error("Failed to export chart:", error);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.loadingScreen}>
        <p className={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>An overview of storage, revenue, and tasks.</p>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.calendarWrapper}>
              <button onClick={() => setCalendarOpen((prev) => !prev)} className={styles.dateButton}>
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
                <div className={styles.calendarPopover}>
                  <Calendar
                    onRangeChange={handleRangeChange}
                    onClose={() => setCalendarOpen(false)}
                    initialRange={dateRange}
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={!canExport}
              className={styles.exportButton}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 9.33333V0.5M7 9.33333L3.5 5.83333M7 9.33333L10.5 5.83333M0.5 9.33333V12.1667C0.5 12.6269 0.8731 13 1.33333 13H12.6667C13.1269 13 13.5 12.6269 13.5 12.1667V9.33333" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export
            </button>
          </div>
        </div>

        <div className={styles.tasksCard}>
          <div className={styles.tasksCardInner}>
            <div className={styles.tasksTabsRow}>
              <div className={styles.tasksTabs}>
                <button
                  type="button"
                  onClick={() => setActiveTaskTab("tasks")}
                  className={`${styles.taskTab} ${activeTaskTab === "tasks" ? styles.taskTabActiveBorder : styles.taskTabInactiveBorder}`}
                >
                  <p className={`${styles.taskTabLabel} ${activeTaskTab === "tasks" ? styles.taskTabLabelActive : styles.taskTabLabelInactive}`}>
                    Tasks
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTaskTab("upcoming")}
                  className={`${styles.taskTab} ${activeTaskTab === "upcoming" ? styles.taskTabActiveBorder : styles.taskTabInactiveBorder}`}
                >
                  <p className={`${styles.taskTabLabel} ${activeTaskTab === "upcoming" ? styles.taskTabLabelActive : styles.taskTabLabelInactive}`}>
                    Upcoming
                  </p>
                </button>
              </div>
            </div>

            <div className={styles.taskList}>
              {visibleTasksWithIndex.map(({ date, lot, suffix, completed, originalIndex }, index) => {
                const icon = completed ? taskIconChecked : taskIconEmpty;
                const dateClass = completed ? styles.taskDateDone : styles.taskDatePending;
                const textClass = completed ? styles.taskTextDone : styles.taskTextPending;

                return (
                  <div
                    key={`${date}-${lot}-${index}`}
                    onClick={() => handleToggleTask(originalIndex)}
                    className={styles.taskRow}
                  >
                    <div className={styles.taskRowLeft}>
                      <div className={styles.taskIconWrap}>
                        <div className={styles.taskIconInner}>
                          <img alt="" className={styles.taskIconImg} src={icon} />
                        </div>
                      </div>
                      <p className={`${styles.taskDate} ${dateClass}`}>{date}</p>
                    </div>

                    <p className={`${styles.taskText} ${textClass}`}>
                      <span className={styles.taskLotLink}>{lot}</span>
                      <span>{suffix}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.metricsCard}>
          <section className={styles.metricsGrid}>
            {metricCards.map((item) => {
              // Disable metric card selection when bar count exceeds MAX_BARS
              const isDisabled = tooManyBars;
              const isActive = activeMetric === item.key;

              return (
                <Card
                  key={item.title}
                  className={`${styles.metricCard} ${
                    isDisabled
                      ? styles.metricCardDisabled
                      : isActive
                        ? styles.metricCardActive
                        : `group ${styles.metricCardInactive}`
                  }`}
                  onClick={() => {
                    if (!isDisabled) setActiveMetric(item.key);
                  }}
                >
                  {!isActive && !isDisabled && <div className={styles.metricCardHoverBar} />}
                  {isActive && !isDisabled && <div className={styles.metricCardActiveBar} />}
                  <CardHeader className={styles.metricCardHeader}>
                    <CardDescription className={styles.metricCardDescription}>
                      {item.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={styles.metricCardContent}>
                    <CardTitle className={styles.metricCardTitle}>{item.value}</CardTitle>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <Card className={styles.chartCard}>
            <CardContent className={styles.chartCardContent}>
              <div ref={chartExportRef} className={styles.chartExportArea}>
                <p className={styles.chartLabel}>
                  {getMetricTitle(activeMetric)} — {formatDateLabel(dateRange.from)} – {formatDateLabel(dateRange.to)}
                </p>

                <div className={styles.chartArea}>
                  {loading && (
                    <div className={styles.chartLoadingOverlay}>
                      <p className={styles.chartLoadingText}>Loading metrics...</p>
                    </div>
                  )}

                  <Graph data={chartData} barLabelFormatter={graphLabelFormatter} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}