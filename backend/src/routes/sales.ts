import express from "express";
import {
  getAllSales,
  getSaleById,
  addSale,
  updateSale,
  deleteSale,
} from "../controllers/sales";
import { authenticateToken } from "../middleware/middleware";

const router = express.Router();

router.get("/getAllSales", authenticateToken, getAllSales);
router.get("/getSaleById/:id", authenticateToken, getSaleById);
router.post("/addSale", authenticateToken, addSale);
router.patch("/updateSale/:id", authenticateToken, updateSale);
router.delete("/deleteSale/:id", authenticateToken, deleteSale);
// Write route for getSalesByItemId


export default router;
