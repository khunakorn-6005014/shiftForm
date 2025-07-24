// src/routes/shiftRoutes.js
import express from "express"
import {getAllShifts,addShift,updateShiftById,deleteShift,getShiftById} from "../controllers/shiftController.js"
const { protect } = require('../middlewares/authMiddleware');
const router       = express.Router();
// Public endpoints
router.get('/', protect,  getAllShifts);
router.get('/:id', protect,  getShiftById);
router.post('/', protect,  addShift);
router.patch('/:id', protect,  updateShiftById);

// Admin‐only delete
router.delete('/:id', protect, deleteShift);

module.exports = router;