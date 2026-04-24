import { apiRequest } from "./APIWrapper";

export type WeeklyBucket = {
  label: string;
  grossIncome: number;
};

export type DashboardMetrics = {
  grossIncome: number;
  profit: number;
  totalCost: number;
  weightOfWoolSold: number;
  weeklyData: WeeklyBucket[];
};

export const getDashboardMetrics = async (
  startDate: Date,
  endDate: Date
): Promise<DashboardMetrics> => {
  const start = startDate.toISOString().split("T")[0]; 
  const end = endDate.toISOString().split("T")[0];

  return apiRequest<DashboardMetrics>(
    `/api/dashboard/metrics?startDate=${start}&endDate=${end}`,
    { method: "GET" }
  );
};