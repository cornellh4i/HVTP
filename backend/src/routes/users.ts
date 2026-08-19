import express from "express";
import {
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUser,
} from "../controllers/user";

// This is is where you would write the code for the User Routes. 
// You would call your implementation on `controllers/users.ts`

const router = express.Router();

router.get('/getAllUsers', getAllUsers); // GET /api/middleware/getAllUsers
router.get('/getUserById', getUserById); // GET /api/middleware/getUserById?id=123
router.patch('/updateUser', updateUser); // PATCH /api/middleware/updateUser
router.delete('/deleteUser/:id', deleteUserById); // DELETE /api/middleware/:id

export default router;
