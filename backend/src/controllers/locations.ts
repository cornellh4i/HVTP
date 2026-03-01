import { Request, Response } from "express";
import { getDb } from "../config/firebase";

const db = getDb();


export const allLocations = async (req: Request, res: Response) => { // get all items
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

export const getLocationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const doc = await db.collection("locations").doc(id as string).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Location not found" });
    }

    return res.status(200).json({
      id: doc.id,
      ...doc.data()
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error fetching location",
      error
    });
  }
};


export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const docRef = db.collection("locations").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Location not found" });
    }

    await docRef.update(updates);

    return res.status(200).json({
      message: "Location updated successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error updating location",
      error
    });
  }
};

export const addLocation = async (req: Request, res: Response) => {
  try {
    const newLocation = req.body;

    if (
      !newLocation.createdAt ||
      !newLocation.isActive ||
      !newLocation.name ||
      !newLocation.section
    ) { 
      return res.status(400).json({ error: "Missing required fields for location" });
    }

    const docRef = await db.collection("locations").add(newLocation);

    return res.status(201).json({
      id: docRef.id,
      ...newLocation,
    });

  } catch (error) {
    return res.status(500).json({ message: "Error creating location", error });
  }
};