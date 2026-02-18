import { ItemFields, ItemInsert, ItemUpdate } from '../models/item';
import { getDb } from '../config/firebase';
import { Request, Response } from "express";
// This is is where you would write the code for the User controllers
const db = getDb();

export const getAllItems = async (req: Request, res: Response) => {
    try {
        const itemsSnapshot = await db.collection('items').get();
        const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(items)
    } catch (error){
        res.status(500).json({ message: 'Error fetching items', error });
    }
}

export const addItem = async (req: Request, res: Response) => {
  try {
    const newItem = req.body;

    if (!newItem.name || !newItem.price)
      return res.status(400).json({ error: "Missing fields" });

    const ref = await db.collection("items").add(newItem);

    res.status(201).json({ id: ref.id });
  } catch {
    res.status(500).json({ error: "Error adding item" });
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const doc = await db.collection("items").doc(String(id)).get();

    if (!doc.exists)
      return res.status(404).json({ error: "Item not found" });

    res.json({ id: doc.id, ...doc.data() });
  } catch {
    res.status(500).json({ error: "Error retrieving item" });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    await db.collection("items").doc(String(id)).update(req.body);

    res.json({ message: "Item updated" });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
};
