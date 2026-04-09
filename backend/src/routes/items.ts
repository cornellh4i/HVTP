import express from "express";
import {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  getPublicItems,
  togglePublish,
  getActiveItems,
  getInactiveItems,
  toggleActive,
  getFarmerByItemId,
} from "../controllers/items";
import { authenticateToken } from "../middleware/middleware";

const router = express.Router();

router.get("/getAllItems", getAllItems);
router.get("/getItemById/:id", getItemById);
router.post("/addItem", addItem);
router.patch("/updateItem/:id", updateItem);
router.delete("/deleteItem/:id", deleteItem);
router.patch("/togglePublish/:id", authenticateToken, togglePublish);

router.get("/getActiveItems", getActiveItems);
router.get("/getInactiveItems", getInactiveItems);
router.patch("/toggleActive/:id", toggleActive);
router.get("/getFarmerByItemId/:id", getFarmerByItemId);

// Public — no auth
router.get("/public/items", getPublicItems);

export default router;