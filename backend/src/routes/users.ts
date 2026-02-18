import express from "express";
import { getAllUsers, getUserById } from "../controllers/user";
import { authenticateToken } from "../middleware/middleware";

// This is is where you would write the code for the User Routes. 
// You would call your implementation on `controllers/users.ts`

const router = express.Router();

router.get('/getAllUsers', authenticateToken, getAllUsers);
router.get('/getUserById', authenticateToken, getUserById);

export default router;
