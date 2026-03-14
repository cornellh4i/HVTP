import express from "express";
import { addAuditLog, updateAuditLog, getAllAuditLogs, getAuditLogByItemId } from "../controllers/auditLogs";

const router = express.Router();

router.post("/addAuditLog", addAuditLog);
router.patch("/updateAuditLog", updateAuditLog);
router.get("/allAuditLogs", getAllAuditLogs);
router.get("/AuditLogByItemId", getAuditLogByItemId);

export default router;
