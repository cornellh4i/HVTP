import express from "express";
import {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  getPublicItems,
  togglePublish,
} from "../controllers/items";
import { authenticateToken } from "../middleware/middleware";

const router = express.Router();

router.get("/getAllItems", getAllItems);
router.get("/getItemById/:id", getItemById);
router.post("/addItem", addItem);
router.patch("/updateItem/:id", updateItem);
router.delete("/deleteItem/:id", deleteItem);
router.patch("/togglePublish/:id", authenticateToken, togglePublish);

// Public — no auth
router.get("/public/items", getPublicItems);

export default router;
