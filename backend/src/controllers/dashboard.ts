import { Request, Response } from "express";
import { computeDashboardMetrics } from "../services/dashboardMetrics";

export async function getDashboardMetrics(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ success: false, error: "startDate and endDate query params are required" });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ success: false, error: "Invalid date format. Use ISO 8601 (e.g. 2026-02-11)" });
      return;
    }

    if (start > end) {
      res.status(400).json({ success: false, error: "startDate must be before or equal to endDate" });
      return;
    }

    const data = await computeDashboardMetrics(start, end);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
