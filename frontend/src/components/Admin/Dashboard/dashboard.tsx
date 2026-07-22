"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/utils/AuthContext";
import { Check, ChevronDown } from "lucide-react";
import Calendar from "./Calendar/calendar";
import { getDashboardMetrics, DashboardMetrics } from "@/api/dashboard";
import Graph from "./Graph/graph";
import { exportChartAsPng } from "./exportChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import styles from "./dashboard.module.css";
import {
  aggregateBuckets,
  CONTAINER_LABELS,
  CONTAINER_SIZES,
  ContainerSize,
  isContainerSelectable,
  resolveContainerSize,
} from "./containerSize";

function defaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return { from: start, to: end };
}

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
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} lb`;
}

type MetricKey = "profit" | "grossIncome" | "woolCost" | "weightOfWoolSold" | "inventoryCost";

function getMetricTitle(metric: MetricKey): string {
  if (metric === "profit") return "Profit";
  if (metric === "grossIncome") return "Gross Income";
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
  const { loading: authLoading } = useAuth();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [containerOpen, setContainerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(defaultDateRange);
  const [containerSize, setContainerSize] = useState<ContainerSize>("weekly");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("profit");
  const [activeTaskTab, setActiveTaskTab] = useState<"tasks" | "upcoming">("tasks");
  const [tasks, setTasks] = useState(initialTasks);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const chartExportRef = useRef<HTMLDivElement>(null);
  const containerMenuRef = useRef<HTMLDivElement>(null);

  const handleRangeChange = (start: Date, end: Date) => {
    setCalendarOpen(false);

    const resolved = resolveContainerSize(start, end, containerSize);
    if (resolved.changed) {
      setToastMessage(
        `More than 12 bars being displayed, container changed to '${CONTAINER_LABELS[resolved.size].toLowerCase()}' from '${CONTAINER_LABELS[resolved.previous].toLowerCase()}'`
      );
      setContainerSize(resolved.size);
    }

    setDateRange({ from: start, to: end });
  };

  const handleContainerSelect = (size: ContainerSize) => {
    if (!isContainerSelectable(dateRange.from, dateRange.to, size)) {
      return;
    }
    setContainerSize(size);
    setContainerOpen(false);
  };

  const handleToggleTask = (taskIndex: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task, index) =>
        index === taskIndex ? { ...task, completed: !task.completed } : task
      )
    );
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerMenuRef.current && !containerMenuRef.current.contains(e.target as Node)) {
        setContainerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

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

  const buckets = aggregateBuckets(metrics?.weeklyData ?? [], containerSize);

  const chartData = buckets.map((bucket) => {
    if (activeMetric === "profit") return { label: bucket.label, value: bucket.profit };
    if (activeMetric === "woolCost") return { label: bucket.label, value: bucket.woolCost };
    if (activeMetric === "weightOfWoolSold") return { label: bucket.label, value: bucket.weightSold };
    if (activeMetric === "inventoryCost") {
      const bucketCount = Math.max(buckets.length, 1);
      return { label: bucket.label, value: (metrics?.inventoryCost ?? 0) / bucketCount };
    }
    return { label: bucket.label, value: bucket.grossIncome };
  });

  const metricCards = [
    {
      key: "profit" as const,
      title: "Profit",
      value: metrics ? formatCurrency(metrics.profit) : "—",
    },
    {
      key: "grossIncome" as const,
      title: "Gross Income",
      value: metrics ? formatCurrency(metrics.grossIncome) : "—",
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
    originalIndex: tasks.findIndex(
      (t) => t.date === task.date && t.lot === task.lot && t.suffix === task.suffix
    ),
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
            <div className={styles.containerWrapper} ref={containerMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setContainerOpen((prev) => !prev);
                  setCalendarOpen(false);
                }}
                className={styles.containerButton}
                aria-haspopup="listbox"
                aria-expanded={containerOpen}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden>
                  <path
                    d="M4.08333 0.5V3.5M9.91667 0.5V3.5M0.5 6.5H13.5M2 2H12C12.8036 2 13.5 2.67645 13.5 3.5V13.5C13.5 14.3236 12.8036 15 12 15H2C1.19645 15 0.5 14.3236 0.5 13.5V3.5C0.5 2.67645 1.19645 2 2 2Z"
                    stroke="#3a4f0d"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{CONTAINER_LABELS[containerSize]}</span>
                <ChevronDown className="size-4 text-[#3a4f0d]" />
              </button>

              {containerOpen && (
                <div className={styles.containerMenu} role="listbox">
                  {CONTAINER_SIZES.map((size) => {
                    const selectable = isContainerSelectable(dateRange.from, dateRange.to, size);
                    const isActive = containerSize === size;

                    return (
                      <button
                        key={size}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        disabled={!selectable}
                        onClick={() => handleContainerSelect(size)}
                        className={`${styles.containerOption} ${
                          isActive ? styles.containerOptionActive : ""
                        } ${!selectable ? styles.containerOptionDisabled : ""}`}
                      >
                        {CONTAINER_LABELS[size]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={styles.calendarWrapper}>
              <button
                type="button"
                onClick={() => {
                  setCalendarOpen((prev) => !prev);
                  setContainerOpen(false);
                }}
                className={styles.dateButton}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden>
                  <path
                    d="M4.08333 0.5V3.5M9.91667 0.5V3.5M0.5 6.5H13.5M2 2H12C12.8036 2 13.5 2.67645 13.5 3.5V13.5C13.5 14.3236 12.8036 15 12 15H2C1.19645 15 0.5 14.3236 0.5 13.5V3.5C0.5 2.67645 1.19645 2 2 2Z"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>
                  {formatDateLabel(dateRange.from)} - {formatDateLabel(dateRange.to)}
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
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M7 9.33333V0.5M7 9.33333L3.5 5.83333M7 9.33333L10.5 5.83333M0.5 9.33333V12.1667C0.5 12.6269 0.8731 13 1.33333 13H12.6667C13.1269 13 13.5 12.6269 13.5 12.1667V9.33333"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
                  className={`${styles.taskTab} ${
                    activeTaskTab === "tasks"
                      ? styles.taskTabActiveBorder
                      : styles.taskTabInactiveBorder
                  }`}
                >
                  <p
                    className={`${styles.taskTabLabel} ${
                      activeTaskTab === "tasks"
                        ? styles.taskTabLabelActive
                        : styles.taskTabLabelInactive
                    }`}
                  >
                    Tasks
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTaskTab("upcoming")}
                  className={`${styles.taskTab} ${
                    activeTaskTab === "upcoming"
                      ? styles.taskTabActiveBorder
                      : styles.taskTabInactiveBorder
                  }`}
                >
                  <p
                    className={`${styles.taskTabLabel} ${
                      activeTaskTab === "upcoming"
                        ? styles.taskTabLabelActive
                        : styles.taskTabLabelInactive
                    }`}
                  >
                    Upcoming
                  </p>
                </button>
              </div>
            </div>

            <div className={styles.taskList}>
              {visibleTasksWithIndex.map(({ date, lot, suffix, completed, originalIndex }, index) => {
                const dateClass = completed ? styles.taskDateDone : styles.taskDatePending;
                const textClass = completed ? styles.taskTextDone : styles.taskTextPending;

                return (
                  <div
                    key={`${date}-${lot}-${index}`}
                    onClick={() => handleToggleTask(originalIndex)}
                    className={styles.taskRow}
                    role="checkbox"
                    aria-checked={completed}
                  >
                    <div className={styles.taskRowLeft}>
                      <div
                        className={`${styles.taskCheckbox} ${
                          completed ? styles.taskCheckboxChecked : ""
                        }`}
                      >
                        {completed && <Check className={styles.taskCheckboxIcon} strokeWidth={3} />}
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
              const isActive = activeMetric === item.key;

              return (
                <Card
                  key={item.title}
                  className={`${styles.metricCard} ${
                    isActive
                      ? styles.metricCardActive
                      : `group ${styles.metricCardInactive}`
                  }`}
                  onClick={() => setActiveMetric(item.key)}
                >
                  {!isActive && <div className={styles.metricCardHoverBar} />}
                  {isActive && <div className={styles.metricCardActiveBar} />}
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
                  {getMetricTitle(activeMetric)} — {formatDateLabel(dateRange.from)} –{" "}
                  {formatDateLabel(dateRange.to)}
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

      {toastMessage && (
        <div className={styles.toast} role="status">
          <div className={styles.toastInner}>
            <p className={styles.toastTitle}>{toastMessage}</p>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className={styles.toastClose}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
