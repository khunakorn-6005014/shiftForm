// src/routes/shiftRoutes.js
const express = require('express');
const {getAllShifts,addShift,updateShiftById,deleteShift,getShiftById} = require('../controllers/shiftController');
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