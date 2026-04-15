import { Request, Response } from "express";
import { ItemInsert, ItemUpdate } from "../models/item";
import { getDb } from "../config/firebase";
import { successJson, errorJson } from "../utils/jsonResponses";

const db = getDb();

export const getAllItems = async (_req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("items").get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as ItemInsert),
    }));
    res.status(200).json(successJson(items));
  } catch (error) {
    res.status(500).json(errorJson("Error fetching items"));
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("items").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json(errorJson("Item not found"));
    }

    res.status(200).json(successJson({ id: doc.id, ...doc.data() }));
  } catch {
    res.status(500).json(errorJson("Error retrieving item"));
  }
};

export const addItem = async (
  req: Request<{}, {}, ItemInsert>,
  res: Response
) => {
  try {
    const newItem = req.body;

    if (
      !newItem.farmerId ||
      !newItem.name ||
      !newItem.sku ||
      !newItem.breed ||
      !newItem.grade ||
      !newItem.color ||
      newItem.weight === undefined ||
      !newItem.status ||
      !newItem.images || !Array.isArray(newItem.images) || newItem.images.length === 0 ||
      !newItem.coverImage ||
      !newItem.qrCode ||
      newItem.isActive === undefined ||
      !newItem.createdAt
    ) {
      return res.status(400).json(errorJson("Missing required fields"));
    }

    const ref = await db.collection("items").add(newItem);
    res.status(201).json(successJson({ id: ref.id }));
  } catch {
    res.status(500).json(errorJson("Error adding item"));
  }
};

export const updateItem = async (
  req: Request<{ id: string }, {}, ItemUpdate>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("items").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json(errorJson("Item not found"));
    }

    await doc.ref.update(req.body);
    res.status(200).json(successJson({ id }));
  } catch {
    res.status(500).json(errorJson("Update failed"));
  }
};

export const getPublicItems = async (_req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("items").where("isPublic", "==", true).get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as ItemInsert),
    }));
    res.status(200).json(successJson(items));
  } catch(err) {
    console.error("getPublicItems failed:", err);
    res.status(500).json(errorJson("Error fetching public items"));
  }
};

export const togglePublish = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("items").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json(errorJson("Item not found"));
    }

    const current = (doc.data() as ItemInsert).isPublic ?? false;
    await doc.ref.update({ isPublic: !current });
    res.status(200).json(successJson({ id, isPublic: !current }));
  } catch {
    res.status(500).json(errorJson("Error toggling publish state"));
  }
};

export const getActiveItems = async(_req: Request, res: Response) => { 
  try { 
    const snapshot = await db.collection("items").where("isActive", "==", true).get();
    const items = snapshot.docs.map((doc) => ({ 
      id : doc.id,
      ...(doc.data() as ItemInsert),
    }));

    res.status(200).json(successJson(items));

  } catch { 
    res.status(500).json(errorJson("Error fetching active items"))
  }
}

export const getInactiveItems = async(_req: Request, res: Response) => { 
  try { 
    const snapshot = await db.collection("items").where("isActive", "==", false).get();
    const items = snapshot.docs.map((doc) => ({ 
      id : doc.id, 
      ...(doc.data() as ItemInsert),
    }));
    res.status(200).json(successJson(items))


  } catch { 
    res.status(500).json(errorJson("Error fetching in active items"))
  }
}

export const toggleActive = async (req: Request<{id: string }> , res: Response) => { 
  try { 
    const { id } = req.params; 
    const doc = await db.collection("items").doc(id).get(); 

    if (!doc.exists) { 
      return res.status(404).json(errorJson("Item not found"))
    }

    const current = (doc.data() as ItemInsert).isActive ?? false;
    await doc.ref.update({ isActive: !current});
    res.status(200).json(successJson({ id, isActive: !current}))
  } catch { 
    res.status(500).json(errorJson("Error toggling active state"))
  }
}

export const deleteItem = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("items").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json(errorJson("Item not found"));
    }

    await doc.ref.delete();
    res.status(200).json(successJson({ id }));
  } catch {
    res.status(500).json(errorJson("Delete failed"));
  }
};

export const getFarmerByItemId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("items").doc(id).get(); 

    if (!doc.exists) { 
      return res.status(404).json(errorJson("Item not found"))
    }
    const farmerId = doc.data()?.farmerId; 

    if (!farmerId){ 
      return res.status(404).json(errorJson("Item had no associated farmer"))
    }

    const snapshot = await db
      .collection("farmers")
      .doc(farmerId)
      .get();

    if (!snapshot.exists) {
      return res.status(404).json(errorJson("Farmer not found"));
    }

    res.status(200).json(successJson({ id: snapshot.id, ...snapshot.data() }));

  } catch {
    res.status(500).json(errorJson("Error retrieving farmer"));
  }
};