import { Location } from "../models/location";
import { Request, Response } from "express";
import { getDb } from "../config/firebase";

const db = getDb();


export const getAllLocations = async (req: Request, res: Response) => {
  try {
    // from the locations collection in Firestore, retrieve all documents
    const snapshot = await db.collection("locations").get();

    // convert each doc (from an array) into an object, store into locations as an array
    const locations: Location[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Location, "id">)
    }));

    return res.status(200).json(locations); // success! send json

  } catch (errror) {
    return res.status(500).json({ message: "Error fetching locations", error: errror });
  }
};