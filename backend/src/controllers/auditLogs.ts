import { getDb } from "../config/firebase";
import { Request, Response } from "express";
import { AuditLogInsert, AuditLogUpdate } from "../models/auditLogs";

const db = getDb();

export const updateAuditLog = async (
  req: Request<{}, {}, AuditLogUpdate>,
  res: Response
) => {
  try {
    const updatedAudit = req.body;

    if (
      updatedAudit.itemId === undefined ||
      updatedAudit.locationsId === undefined ||
      updatedAudit.inventoryId === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const snapshot = await db
      .collection("audit_logs")
      .where("itemId", "==", updatedAudit.itemId)
      .where("locationsId", "==", updatedAudit.locationsId)
      .where("inventoryId", "==", updatedAudit.inventoryId)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Audit log not found" });
    }

    const updatePromises = snapshot.docs.map((doc) =>
      db.collection("audit_logs").doc(doc.id).update(updatedAudit)
    );
    await Promise.all(updatePromises);

    res.status(200).json({ message: "Audit log updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating audit log", error });
  }
};

export const addAuditLog = async (
  req: Request<{}, {}, AuditLogInsert>,
  res: Response
) => {
  try {
    const newAudit = req.body;
    console.log(req.body);

    // ensure all required key fields are present
    if (
      newAudit.itemId === undefined ||
      newAudit.locationsId === undefined ||
      newAudit.inventoryId === undefined ||
      newAudit.previousQty === undefined ||
      newAudit.changeAmt === undefined ||
      newAudit.actionType === undefined ||
      newAudit.newQty === undefined ||
      newAudit.image === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newLog = await db.collection("audit_logs").add(newAudit);
    res.status(201).json({ message: "Audit log added" });
  } catch (error) {
    res.status(500).json({ message: "Error adding audit log", error });
  }
};

export const getAllAuditLogs = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("audit_logs").get();
    const auditLogs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(auditLogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching audit logs", error });
  }
};

export const getAuditLogByItemId = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Missing ID" });
    }

    const snapshot = await db
      .collection("audit_logs")
      .where("itemId", "==", id)
      .get();
    const auditLogs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as AuditLogInsert),
    }));
    if (auditLogs.length == 0) {
      return res.status(404).json({ error: "Audit logs not found" });
    }
    res.status(200).json(auditLogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching audit logs", error });
  }
};
