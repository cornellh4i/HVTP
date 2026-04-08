import express from "express";
import {
  getAllFarmers,
  getFarmerByItemId,
  addFarmer,
  updateFarmer,
  deleteFarmer,
} from "../controllers/farmers";

const router = express.Router();

router.get("/getAllFarmers", getAllFarmers);
router.get("/getFarmerByItemId/:id", getFarmerByItemId);
router.post("/addFarmer", addFarmer);
router.patch("/updateFarmer/:id", updateFarmer);
router.delete("/deleteFarmer/:id", deleteFarmer);

export default router;
