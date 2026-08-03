"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useAuth } from "@/utils/AuthContext";
import { Check, ChevronDown, X } from "lucide-react";
import Calendar from "./Calendar/calendar";
import { getDashboardMetrics } from "@/api/dashboard";
import { getAllTasks, addTask, updateTask, deleteTask, Task } from "@/api/tasks";
import { formatItemDate } from "@/components/Admin/Inventory/inventory-utils";
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

export default function Dashboard() {
  const { loading: authLoading } = useAuth();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [containerOpen, setContainerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(defaultDateRange);
  const [containerSize, setContainerSize] = useState<ContainerSize>("weekly");
  const [activeMetric, setActiveMetric] = useState<MetricKey>("profit");
  const [activeTaskTab, setActiveTaskTab] = useState<"tasks" | "upcoming">("tasks");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const chartExportRef = useRef<HTMLDivElement>(null);
  const containerMenuRef = useRef<HTMLDivElement>(null);

  const metricsKey = !authLoading
    ? (["dashboardMetrics", dateRange.from.getTime(), dateRange.to.getTime()] as const)
    : null;
  const { data: metrics = null, isLoading: loading } = useSWR(metricsKey, ([, fromMs, toMs]) =>
    getDashboardMetrics(new Date(fromMs), new Date(toMs))
  );

  const { data: tasks = [], mutate: mutateTasks } = useSWR<Task[]>(
    !authLoading ? "tasks" : null,
    getAllTasks
  );

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

  const handleToggleTask = async (taskId: string) => {
    const current = tasks.find((t) => t.id === taskId);
    if (!current) return;

    const optimisticData = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    try {
      await mutateTasks(
        async () => {
          await updateTask(taskId, { completed: !current.completed });
          return optimisticData;
        },
        { optimisticData, rollbackOnError: true, revalidate: false }
      );
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    const optimisticData = tasks.filter((task) => task.id !== taskId);

    try {
      await mutateTasks(
        async () => {
          await deleteTask(taskId);
          return optimisticData;
        },
        { optimisticData, rollbackOnError: true, revalidate: false }
      );
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || addingTask) return;

    setAddingTask(true);
    try {
      const created = await addTask({
        title: newTaskTitle.trim(),
        dueDate: newTaskDueDate || null,
      });
      await mutateTasks([...tasks, created], { revalidate: false });
      setNewTaskTitle("");
      setNewTaskDueDate("");
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setAddingTask(false);
    }
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

  const buckets = aggregateBuckets(metrics?.weeklyData ?? [], containerSize);

  const chartData = buckets.map((bucket) => {
    if (activeMetric === "profit") return { label: bucket.label, value: bucket.profit };
    if (activeMetric === "woolCost") return { label: bucket.label, value: bucket.woolCost };
    if (activeMetric === "weightOfWoolSold") return { label: bucket.label, value: bucket.weightSold };
    if (activeMetric === "inventoryCost") return { label: bucket.label, value: bucket.inventoryCost };
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
                    Incomplete
                  </p>
                </button>
              </div>
            </div>

            <div className={styles.taskList}>
              {visibleTasks.map((task) => {
                const dateClass = task.completed ? styles.taskDateDone : styles.taskDatePending;
                const textClass = task.completed ? styles.taskTextDone : styles.taskTextPending;
                const dateLabel =
                  task.type === "manual" && task.dueDate
                    ? formatItemDate(task.dueDate)
                    : formatItemDate(task.createdAt);
                const lotPrefix = task.type === "auto" && task.sku ? `Lot ${task.sku}` : null;

                return (
                  <div
                    key={task.id}
                    onClick={() => void handleToggleTask(task.id)}
                    className={styles.taskRow}
                    role="checkbox"
                    aria-checked={task.completed}
                  >
                    <div className={styles.taskRowLeft}>
                      <div
                        className={`${styles.taskCheckbox} ${
                          task.completed ? styles.taskCheckboxChecked : ""
                        }`}
                      >
                        {task.completed && <Check className={styles.taskCheckboxIcon} strokeWidth={3} />}
                      </div>
                      <p className={`${styles.taskDate} ${dateClass}`}>{dateLabel ?? ""}</p>
                    </div>

                    <p className={`${styles.taskText} ${textClass}`}>
                      {lotPrefix && task.itemId ? (
                        <>
                          <Link
                            href={`/inventory/${task.itemId}`}
                            onClick={(e) => e.stopPropagation()}
                            className={styles.taskLotLink}
                          >
                            {lotPrefix}
                          </Link>
                          <span>{task.title.replace(lotPrefix, "")}</span>
                        </>
                      ) : (
                        <span>{task.title}</span>
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={(e) => void handleDeleteTask(e, task.id)}
                      className={styles.taskDeleteButton}
                      aria-label="Delete task"
                    >
                      <X className={styles.taskDeleteIcon} />
                    </button>
                  </div>
                );
              })}
            </div>

            <form className={styles.addTaskRow} onSubmit={(e) => void handleAddTask(e)}>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a task..."
                className={styles.addTaskInput}
              />
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className={styles.addTaskDateInput}
              />
              <button
                type="submit"
                disabled={!newTaskTitle.trim() || addingTask}
                className={styles.exportButton}
              >
                Add
              </button>
            </form>
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
