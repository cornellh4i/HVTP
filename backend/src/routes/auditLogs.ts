import express from "express";
import { getAllAuditLogs, getAuditLogByItemId } from "../controllers/auditLogs";

const router = express.Router();

router.get("/allAuditLogs", getAllAuditLogs);
router.get("/AuditLogByItemId", getAuditLogByItemId);

export default router;
