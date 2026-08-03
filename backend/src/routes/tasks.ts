import express from "express";
import {
  getAllTasks,
  generateTasks,
  addTask,
  updateTask,
  deleteTask,
} from "../controllers/tasks";
import { authenticateToken } from "../middleware/middleware";

const router = express.Router();

router.get("/getAllTasks", authenticateToken, getAllTasks);
router.post("/generateTasks", authenticateToken, generateTasks);
router.post("/addTask", authenticateToken, addTask);
router.patch("/updateTask/:id", authenticateToken, updateTask);
router.delete("/deleteTask/:id", authenticateToken, deleteTask);

export default router;
