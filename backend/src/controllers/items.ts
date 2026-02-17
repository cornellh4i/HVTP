import express from "express";
import { Request, Response } from "express";
import { ItemFields, ItemInsert, ItemUpdate } from '../models/item';
import { getDb } from '../config/firebase';
// This is is where you would write the code for the User controllers

export const getAllItems = async (req : Request, res : Response) =>  {
    try {
        const db = getDb();
        const snapshot = await db.collection("items").get();

        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        return res.status(200).json(items);
    } 
    catch (err) {
        return res.status(500).json({ error: "Failed to fetch items" });
    } 
}
