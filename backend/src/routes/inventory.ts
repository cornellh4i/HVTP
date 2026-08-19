import express from "express";
import {
    getAllInventory,
    getInventoryByItemId, 
    addInventory, 
    updateInventory
} from '../controllers/inventory';


const router = express.Router()

router.get('/allInventories', getAllInventory);
router.get('/inventoryByItemId', getInventoryByItemId);



router.post("/addInventory", addInventory);
router.patch("/updateInventory", updateInventory);

export default router;
