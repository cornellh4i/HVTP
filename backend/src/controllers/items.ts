import express from "express";
import { Request, Response } from "express";
import { ItemFields, ItemInsert, ItemUpdate } from "../models/item";
import { getDb } from "../config/firebase";
// This is is where you would write the code for the User controllers
const db = getDb();

export const getAllItems = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("items").get();
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const snapshot = await db.collection("items").where("id", "==", id).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Item not found" });
    }

    const doc = snapshot.docs[0];
    res.status(200).json({ docId: doc.id, ...doc.data() });
  } catch {
    res.status(500).json({ error: "Error retrieving item" });
  }
};

export const addItem = async (req: Request, res: Response) => {
  try {
    const newItem = req.body;

    if (
      !newItem.name ||
      !newItem.category ||
      !newItem.description ||
      !newItem.image ||
      !newItem.sku ||
      !newItem.qrcode ||
      newItem.isActive === undefined ||
      !newItem.createdAt
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await db.collection("items").add(newItem);
    res.status(201).json({ message: "Item added" });
  } catch {
    res.status(500).json({ error: "Error adding item" });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const snapshot = await db.collection("items").where("id", "==", id).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Item not found" });
    }

    const ref = snapshot.docs[0].ref;
    ref.update(req.body);
    res.status(200).json({ message: "Item updated" });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
};
