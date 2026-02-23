import { Location } from "../models/location";
import { Request, Response } from "express";
import { getDb } from "../config/firebase";
import { Timestamp } from "firebase-admin/firestore";

const db = getDb();

export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("locations").get();

    const locations: Location[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Location, "id">)
    }));

    return res.status(200).json(locations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching locations" });
  }
};