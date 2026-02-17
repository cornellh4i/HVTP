import express from "express";
// This is is where you would write the code for the User Routes. 
// You would call your implementation on `controllers/items.ts`
import bodyParser from "body-parser";
import customerRouter from "../customers/views";
import swaggerUI from "swagger-ui-express";
import spec from "../../api-spec.json";
import { dbConnect } from "../database";
import { getAllItems } from "../controllers/items";

const router = express.Router();

// Routes
router.get("/allItems", getAllItems);

export default router;