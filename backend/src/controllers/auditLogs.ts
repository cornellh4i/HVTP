import {getDb} from '../config/firebase';
import { Request, Response } from 'express';

const db = getDb();

export const updateAuditLog = async (req: Request, res: Response) => {
    try {
        const updatedAudit = req.body;

        if (!updatedAudit.itemId || !updatedAudit.locationId || !updatedAudit.inventoryId) {
            return res.status(400).json({ error: "Missing required fields" });
        } 

        const snapshot = await db.collection("audit_logs")
            .where("itemId", "==", updatedAudit.itemId)
            .where("locationId", "==", updatedAudit.locationId)
            .where("inventoryId", "==", updatedAudit.inventoryId)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ error: "Audit log not found" });
        }
        
        const updatePromises = snapshot.docs.map(doc => 
            db.collection("audit_logs").doc(doc.id).update(updatedAudit)
        );
        await Promise.all(updatePromises);

        res.status(200).json({ message: "Audit log updated"});

    } catch (error) {
        res.status(500).json({ message: "Error updating audit log", error });
    }
}

export const addAuditLog = async (req: Request, res: Response) => {
    try {
        const newAudit = req.body;
        console.log(req.body);

        // ensure all required key fields are present 
        if (!newAudit.itemId || !newAudit.locationId || !newAudit.inventoryId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newLog = await db.collection("audit_logs").add(newAudit);
        res.status(201).json({ message: "Item added" });
        
    } catch (error) {
        res.status(500).json({ message: "Error adding audit log", error });
    }
}