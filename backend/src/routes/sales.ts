import express from "express";
import {
  getAllSales,
  getSaleById,
  getSalesByItemId,
  addSale,
  updateSale,
  deleteSale,
} from "../controllers/sales";
import { authenticateToken } from "../middleware/middleware";

const router = express.Router();

router.get("/getAllSales", authenticateToken, getAllSales);
router.get("/getSaleById/:id", authenticateToken, getSaleById);
router.get("/getSalesByItemId/:id", authenticateToken, getSalesByItemId);
router.post("/addSale", authenticateToken, addSale);
router.patch("/updateSale/:id", authenticateToken, updateSale);
router.delete("/deleteSale/:id", authenticateToken, deleteSale);

export default router;
