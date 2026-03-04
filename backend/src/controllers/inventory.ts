import { getDb } from '../config/firebase';
import { Request, Response } from 'express';
import { successJson, errorJson } from '../utils/jsonResponses';
import { InventoryFields } from '../models/inventory';

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
