"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const locations_1 = require("../controllers/locations");
const router = express_1.default.Router();
router.get("/locations", locations_1.allLocations);
router.get("/locationById/:id", locations_1.getLocationById);
router.patch("/updateLocation/:id", locations_1.updateLocation);
router.post("/addLocation", locations_1.addLocation);
exports.default = router;
