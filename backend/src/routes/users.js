"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const middleware_1 = require("../middleware/middleware");
// This is is where you would write the code for the User Routes. 
// You would call your implementation on `controllers/users.ts`
const router = express_1.default.Router();
router.get('/getAllUsers', middleware_1.authenticateToken, user_1.getAllUsers); // GET /api/middleware/getAllUsers
router.get('/getUserById', middleware_1.authenticateToken, user_1.getUserById); // GET /api/middleware/getUserById?id=123
router.post('/addUser', middleware_1.authenticateToken, user_1.addUser); // POST /api/middleware/addUser
router.patch('/updateUser', middleware_1.authenticateToken, user_1.updateUser); // PATCH /api/middleware/updateUser
router.delete('/deleteUser/:id', middleware_1.authenticateToken, user_1.deleteUserById); // DELETE /api/middleware/:id
exports.default = router;
