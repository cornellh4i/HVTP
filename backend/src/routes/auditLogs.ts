import express from "express";

import { addAuditLog, updateAuditLog } from "../controllers/auditLogs";

const router = express.Router();

router.post("/addAuditLog", addAuditLog);
router.patch("/updateAuditLog", updateAuditLog);

export default router;