import { getDb } from '../config/firebase';
import { Request, Response } from 'express';
import { successJson, errorJson } from '../utils/jsonResponses';
import { InventoryFields } from '../models/inventory';

const db = getDb();

type InventoryInsertBody = {
  itemId?: unknown;
  locationsId?: unknown;
  quantity?: unknown;
  isActive?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const isInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value);

const isMissing = (value: unknown): boolean =>
  value === undefined || value === null || value === "";

export const getAllInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = getDb();
        const inventorySnapshot = await db.collection('inventory').get();
        const inventories: InventoryFields[] = [];

        inventorySnapshot.forEach(doc => {
            inventories.push({
                ...doc.data()
            } as InventoryFields);
        });
        
        res.status(200).json(successJson(inventories));

    } catch (error) {
        console.error('Error fetching inventory: ', error);
        res.status(500).json(errorJson('Failed to fetch inventory'));
    }
}

export const getInventoryByItemId = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = getDb();
        const { id } = req.query;

        if (!id) {
            res.status(400).json(errorJson('Missing item ID'));
            return;
        }
       
        const inventorySnapshot = await db.collection('inventory')
            .where('itemId', '==', Number(id))
            .get();

        if (inventorySnapshot.empty) {
            res.status(404).json(errorJson('No inventory found for this item ID'));
            return;
        }

        const inventories: InventoryFields[] = [];
        inventorySnapshot.forEach(doc => {
            inventories.push({
                ...doc.data()
            } as InventoryFields);
        });

        res.status(200).json(successJson(inventories));

    } catch (error) {
        console.error('Error fetching inventory by item ID: ', error);
        res.status(500).json(errorJson('Failed to fetch inventory by item ID'));
    }
}


export const addInventory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      itemId,
      locationsId,
      quantity,
      isActive,
      createdAt,
      updatedAt,
    } = req.body as InventoryInsertBody;

    if (
      isMissing(itemId) ||
      isMissing(locationsId) ||
      isMissing(quantity) ||
      isMissing(isActive) ||
      isMissing(createdAt) ||
      isMissing(updatedAt)
    ) {
      res.status(400).json(errorJson("Missing required fields"));
      return;
    }

    if (!isInteger(itemId) || !isInteger(locationsId)) {
      res.status(400).json(errorJson("'itemId' and 'locationsId' must be integers"));
      return;
    }

    if (!isInteger(quantity)) {
      res.status(400).json(errorJson("'quantity' must be an integer"));
      return;
    }

    if (typeof isActive !== "boolean") {
      res.status(400).json(errorJson("'isActive' must be a boolean"));
      return;
    }

    const existing = await db
      .collection("inventory")
      .where("itemId", "==", itemId)
      .where("locationsId", "==", locationsId)
      .limit(1)
      .get();

    if (!existing.empty) {
      res
        .status(409)
        .json(errorJson("Inventory already exists for this itemId and locationsId"));
      return;
    }

    const payload = {
      itemId,
      locationsId,
      quantity,
      isActive,
      createdAt,
      updatedAt,
    };

    const inventoryRef = await db.collection("inventory").add(payload);
    const inventoryDoc = await inventoryRef.get();

    res.status(201).json(
      successJson({
        id: inventoryDoc.id,
        ...inventoryDoc.data(),
      })
    );
  } catch (error) {
    console.error("Error adding inventory:", error);
    res.status(500).json(errorJson("Failed to add inventory"));
  }
};

export const updateInventory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itemId, locationsId, quantity, isActive, updatedAt } =
      req.body as InventoryInsertBody;

    if (!isInteger(itemId) || !isInteger(locationsId)) {
      res
        .status(400)
        .json(errorJson("Missing or invalid 'itemId' and 'locationsId'"));
      return;
    }

    const updates: Record<string, unknown> = {};

    if (quantity !== undefined) {
      if (!isInteger(quantity)) {
        res.status(400).json(errorJson("'quantity' must be an integer"));
        return;
      }
      updates.quantity = quantity;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        res.status(400).json(errorJson("'isActive' must be a boolean"));
        return;
      }
      updates.isActive = isActive;
    }

    if (updatedAt !== undefined) {
      if (isMissing(updatedAt)) {
        res.status(400).json(errorJson("'updatedAt' cannot be empty"));
        return;
      }
      updates.updatedAt = updatedAt;
    }

    if (Object.keys(updates).length === 0) {
      res
        .status(400)
        .json(errorJson("No valid fields to update. Provide quantity, isActive, or updatedAt"));
      return;
    }

    const inventorySnapshot = await db
      .collection("inventory")
      .where("itemId", "==", itemId)
      .where("locationsId", "==", locationsId)
      .limit(1)
      .get();

    if (inventorySnapshot.empty) {
      res.status(404).json(errorJson("Inventory not found"));
      return;
    }

    const inventoryDoc = inventorySnapshot.docs[0];
    await inventoryDoc.ref.update(updates);

    const updatedInventoryDoc = await inventoryDoc.ref.get();
    res.status(200).json(
      successJson({
        id: updatedInventoryDoc.id,
        ...updatedInventoryDoc.data(),
      })
    );
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json(errorJson("Failed to update inventory"));
  }
};
