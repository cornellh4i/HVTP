"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// This is is where you would write the code for the User Routes.
// You would call your implementation on `controllers/items.ts`
const items_1 = require("../controllers/items");
const router = express_1.default.Router();
router.get("/allitems", items_1.getAllItems);
router.get("/itemById", items_1.getItemById);
router.post("/addItem", items_1.addItem);
router.patch("/updateItem", items_1.updateItem);
router.delete("/deleteItem", items_1.deleteItem);
exports.default = router;
