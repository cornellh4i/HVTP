import express from "express";
import {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
} from "../controllers/items";

const router = express.Router();

router.get("/getAllItems", getAllItems);
router.get("/getItemById/:id", getItemById);
router.post("/addItem", addItem);
router.patch("/updateItem/:id", updateItem);
router.delete("/deleteItem/:id", deleteItem);

export default router;
