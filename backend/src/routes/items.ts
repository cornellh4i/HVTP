import express from "express";
import {
  getAllItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
  togglePublish,
  getActiveItems,
  getInactiveItems,
  toggleActive,
  getFarmerByItemId,
  getPublicItems,
  recalculateRemainingWeight,
} from "../controllers/items";

const router = express.Router();

router.get("/getAllItems", getAllItems);
router.get("/getItemById/:id", getItemById);
router.post("/addItem", addItem);
router.patch("/updateItem/:id", updateItem);
router.delete("/deleteItem/:id", deleteItem);
router.patch("/togglePublish/:id", togglePublish);
router.post("/recalculateItemWeight/:id", recalculateRemainingWeight);

router.get("/getActiveItems", getActiveItems);
router.get("/getInactiveItems", getInactiveItems);
router.patch("/toggleActive/:id", toggleActive);
router.get("/getFarmerByItemId/:id", getFarmerByItemId);

// Public — the one route exempted from auth, via PUBLIC_API_PATHS in index.ts.
// Every other route in this file requires a Firebase ID token.
router.get("/public/items", getPublicItems);

export default router;