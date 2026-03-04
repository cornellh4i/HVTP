import express from "express";
import { addInventory, updateInventory } from "../controllers/inventory";

const router = express.Router();

router.post("/addInventory", addInventory);
router.patch("/updateInventory", updateInventory);

export default router;
