import { Request, Response } from "express";
import { FarmerInsert, FarmerUpdate } from "../models/farmer";
import { getDb } from "../config/firebase";
import { successJson, errorJson } from "../utils/jsonResponses";

const db = getDb();

export const getAllFarmers = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("farmers").get();
    const farmers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as FarmerInsert),
    }));
    res.status(200).json(successJson(farmers));
  } catch {
    res.status(500).json(errorJson("Error fetching farmers"));
  }
};


export const addFarmer = async (
  req: Request<{}, {}, FarmerInsert>,
  res: Response
) => {
  try {
    const newFarmer = req.body;

    if (
      !newFarmer.name ||
      !newFarmer.city ||
      !newFarmer.state
    ) {
      return res.status(400).json(errorJson("Missing required fields"));
    }

    const ref = await db.collection("farmers").add(newFarmer);
    res.status(201).json(successJson({ id: ref.id }));
  } catch {
    res.status(500).json(errorJson("Error adding farmer"));
  }
};

export const updateFarmer = async (
  req: Request<{ id: string }, {}, FarmerUpdate>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("farmers").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json(errorJson("Farmer not found"));
    }

    await doc.ref.update(req.body);
    res.status(200).json(successJson({ id }));
  } catch {
    res.status(500).json(errorJson("Update failed"));
  }
};

export const deleteFarmer = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("farmers").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json(errorJson("Farmer not found"));
    }

    await doc.ref.delete();
    res.status(200).json(successJson({ id }));
  } catch {
    res.status(500).json(errorJson("Delete failed"));
  }
};
