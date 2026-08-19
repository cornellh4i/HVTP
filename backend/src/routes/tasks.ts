import express from "express";
import {
  getAllTasks,
  generateTasks,
  addTask,
  updateTask,
  deleteTask,
} from "../controllers/tasks";

const router = express.Router();

router.get("/getAllTasks", getAllTasks);
router.post("/generateTasks", generateTasks);
router.post("/addTask", addTask);
router.patch("/updateTask/:id", updateTask);
router.delete("/deleteTask/:id", deleteTask);

export default router;
