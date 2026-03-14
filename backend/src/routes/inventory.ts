import express from "express";
import {
    getAllInventory,
    getInventoryByItemId, 
    addInventory, 
    updateInventory
} from '../controllers/inventory';

import { authenticateToken } from "../middleware/middleware";

const router = express.Router()

router.get('/allInventories', authenticateToken, getAllInventory);
router.get('/inventoryByItemId', authenticateToken, getInventoryByItemId);



router.post("/addInventory", addInventory);
router.patch("/updateInventory", updateInventory);

export default router;
