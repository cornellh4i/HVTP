import express from "express";
// This is is where you would write the code for the User Routes. 
// You would call your implementation on `controllers/items.ts`
import {
  getAllItems,
  getItemById,
  addItem,
  updateItem
} from "../controllers/items";

const router = express.Router();

router.get("/api/middleware/allitems", getAllItems);
router.get("/api/middleware/itemById", getItemById);
router.post("/api/middleware/addItem", addItem);
router.patch("/api/middleware/updateItem", updateItem);

export default router;