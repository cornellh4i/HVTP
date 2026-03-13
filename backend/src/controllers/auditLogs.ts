import express from "express";
import { Request, Response } from "express";
import { getDb } from "../config/firebase";

const db = getDb();

export const getAllAuditLogs = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("inventory").get();
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
      .collection("inventory")
      .where("itemId", "==", id)
      .get();
    const auditLogs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if (auditLogs.length == 0) {
      return res.status(404).json({ error: "Audit logs not found" });
    }
    res.status(200).json(auditLogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching audit logs", error });
  }
};
