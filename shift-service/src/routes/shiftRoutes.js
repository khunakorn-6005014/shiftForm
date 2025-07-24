// src/routes/shiftRoutes.js
import express from "express"
import {getAllShifts,addShift,updateShiftById,deleteShift,getShiftById} from "../controller/shiftController.js"

const router       = express.Router();
// Public endpoints
router.get('/',  getAllShifts);
router.get('/:id',  getShiftById);
router.post('/',  addShift);
router.patch('/:id',  updateShiftById);

// Admin‐only delete
router.delete('/:id', deleteShift);

export default router;