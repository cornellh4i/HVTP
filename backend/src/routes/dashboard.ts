import { Router } from "express";
import { getDashboardMetrics } from "../controllers/dashboard";

const router = Router();

router.get("/metrics", getDashboardMetrics);

export default router;