import express from "express";
import {
    getAllInventory,
    getInventoryByItemId
} from '../controllers/inventory';
import { authenticateToken } from "../middleware/middleware";

const router = express.Router()

router.get('/allInventories', authenticateToken, getAllInventory);
router.get('/inventoryByItemId', authenticateToken, getInventoryByItemId);

export default router;

