import express from "express";
import { getAllLocations } from "../controller/locations";

const router = express.Router();

router.get("/allLocations", getAllLocations);

export default router;