import express from "express";
import { 
    allLocations,
    getLocationById,    
    updateLocation,
    addLocation,
    deleteLocation

} from "../controllers/locations";


const router = express.Router();

router.get("/locations", allLocations);
router.get("/locationById/:id", getLocationById);
router.patch("/updateLocation/:id", updateLocation);
router.post("/addLocation", addLocation);
router.delete("/deleteLocation/:id", deleteLocation);

export default router;