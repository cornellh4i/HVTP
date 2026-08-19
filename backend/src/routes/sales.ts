import express from "express";
import {
  getAllSales,
  getSaleById,
  getSalesByItemId,
  addSale,
  updateSale,
  deleteSale,
} from "../controllers/sales";

const router = express.Router();

router.get("/getAllSales", getAllSales);
router.get("/getSaleById/:id", getSaleById);
router.get("/getSalesByItemId/:itemId", getSalesByItemId);
router.post("/addSale", addSale);
router.patch("/updateSale/:id", updateSale);
router.delete("/deleteSale/:id", deleteSale);

export default router;
