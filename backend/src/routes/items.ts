import express from 'express';
// This is is where you would write the code for the User Routes. 
// You would call your implementation on `controllers/items.ts`
import {
  getAllItems,
  getItemById,
  addItem,
  updateItem
} from '../controllers/items';

const router = express.Router();

router.get('/allitems', getAllItems);
router.get('/itemById', getItemById);
router.post('/addItem', addItem);
router.patch('/updateItem', updateItem);

export default router;