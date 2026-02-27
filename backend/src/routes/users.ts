import express from "express";
import { getAllUsers, getUserById, deleteUserById } from "../controllers/user";
import { authenticateToken } from "../middleware/middleware";

// This is is where you would write the code for the User Routes. 
// You would call your implementation on `controllers/users.ts`

const router = express.Router();

router.get('/getAllUsers', authenticateToken, getAllUsers); // GET /api/middleware/getAllUsers
router.get('/getUserById', authenticateToken, getUserById); // GET /api/middleware/getUserById?id=123
router.delete('/deleteUser/:id', authenticateToken, deleteUserById); // DELETE /api/middleware/:id

export default router;
