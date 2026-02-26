import express from "express";
import { 
    allLocations,
    getLocationById,    
    updateLocation,
    addLocation

} from "../controllers/locations";


const router = express.Router();

router.get("/locations", allLocations);
router.get("/:id", getLocationById);
router.patch("/:id", updateLocation);
router.post("/", addLocation);

export default router;