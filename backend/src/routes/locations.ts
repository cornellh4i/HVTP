import express from "express";
import { 
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,

} from "../controllers/locations";


const router = express.Router();

router.get("/locations", getAllLocations);
router.get("/:id", getLocationById);
router.post("/", createLocation);
router.put("/:id", updateLocation);

export default router;