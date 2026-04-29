import { Request, Response } from "express";
import { SaleInsert, SaleUpdate } from "../models/sales";
import { ItemInsert } from "../models/item";
import { FarmerInsert } from "../models/farmer";
import { getDb } from "../config/firebase";
import { successJson, errorJson } from "../utils/jsonResponses";

const db = getDb();

export const getAllSales = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("sales").get();
    const sales = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const sale = doc.data() as SaleInsert;
        const joinedFields: Record<string, unknown> = {};

        if (sale.itemId) {
          const itemDoc = await db.collection("items").doc(sale.itemId).get();

          if (itemDoc.exists) {
            const item = itemDoc.data() as ItemInsert;
            Object.assign(joinedFields, {
              itemName: item.name,
              sku: item.sku,
              breed: item.breed,
              grade: item.grade,
              color: item.color,
              status: item.status,
              isPublic: item.isPublic,
              itemWeight: item.weight,
              purchasePrice: item.purchasePrice,
              farmerId: item.farmerId,
            });

            if (item.farmerId) {
              const farmerDoc = await db.collection("farmers").doc(item.farmerId).get();

              if (farmerDoc.exists) {
                const farmer = farmerDoc.data() as FarmerInsert;
                Object.assign(joinedFields, {
                  farmerName: farmer.name,
                  farmerCity: farmer.city,
                  farmerState: farmer.state,
                });
              }
            }
          }
        }

        return {
          id: doc.id,
          ...sale,
          ...joinedFields,
        };
      })
    );
    res.status(200).json(successJson(sales));
  } catch {
    res.status(500).json(errorJson("Error fetching sales"));
  }
};

export const getSaleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("sales").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json(errorJson("Sale not found"));
    }

    res.status(200).json(successJson({ id: doc.id, ...doc.data() }));
  } catch {
    res.status(500).json(errorJson("Error retrieving sale"));
  }
};

export const getSalesByItemId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const snapshot = await db.collection("sales").where("itemId", "==", id).get();

    const sales = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as SaleInsert),
    }));

    res.status(200).json(successJson(sales));
  } catch {
    res.status(500).json(errorJson("Error fetching sales for item"));
  }
};

export const addSale = async (
  req: Request<{}, {}, Omit<SaleInsert, "totalPrice">>,
  res: Response
) => {
  try {
    const body = req.body;

    if (
      !body.itemId ||
      !body.locationsId ||
      !body.inventoryId ||
      body.weightSold === undefined ||
      !body.weightUnit ||
      body.pricePerWeight === undefined ||
      body.costPerWeight === undefined ||
      !body.soldAt ||
      !body.buyerName
    ) {
      return res.status(400).json(errorJson("Missing required fields"));
    }

    if (!["kg", "lb"].includes(body.weightUnit)) {
      return res.status(400).json(errorJson("weightUnit must be 'kg' or 'lb'"));
    }

    if (body.weightSold <= 0 || body.pricePerWeight < 0 || body.costPerWeight < 0) {
      return res.status(400).json(errorJson("weightSold must be positive; prices must be non-negative"));
    }

    const totalPrice = body.weightSold * body.pricePerWeight;
    const newSale: SaleInsert = { ...body, totalPrice };

    const ref = await db.collection("sales").add(newSale);
    res.status(201).json(successJson({ id: ref.id, totalPrice }));
  } catch {
    res.status(500).json(errorJson("Error recording sale"));
  }
};

export const updateSale = async (
  req: Request<{ id: string }, {}, SaleUpdate>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const doc = await db.collection("sales").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json(errorJson("Sale not found"));
    }

    // Recompute totalPrice if weight or price fields changed
    const existing = doc.data() as SaleInsert;
    const weightSold = updates.weightSold ?? existing.weightSold;
    const pricePerWeight = updates.pricePerWeight ?? existing.pricePerWeight;
    const payload: SaleUpdate = { ...updates, totalPrice: weightSold * pricePerWeight };

    await doc.ref.update(payload);
    res.status(200).json(successJson({ id }));
  } catch {
    res.status(500).json(errorJson("Error updating sale"));
  }
};

export const deleteSale = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("sales").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json(errorJson("Sale not found"));
    }

    await doc.ref.delete();
    res.status(200).json(successJson({ id }));
  } catch {
    res.status(500).json(errorJson("Error deleting sale"));
  }
};
