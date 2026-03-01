import express from "express";
import { 
    allLocations,
    getLocationById,    
    updateLocation,
    addLocation

} from "../controllers/locations";


const router = express.Router();

router.get("/locations", allLocations);
router.get("/locationById/:id", getLocationById);
router.patch("/updateLocation/:id", updateLocation);
router.post("/addLocation", addLocation);

export default router;