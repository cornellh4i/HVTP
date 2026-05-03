import express from "express";
import {
  getAllFarmers,
  addFarmer,
  updateFarmer,
  deleteFarmer,
} from "../controllers/farmers";
import { getFarmerByItemId } from "../controllers/items";

const router = express.Router();

router.get("/getAllFarmers", getAllFarmers);
router.post("/addFarmer", addFarmer);
router.patch("/updateFarmer/:id", updateFarmer);
router.delete("/deleteFarmer/:id", deleteFarmer);

export default router;
