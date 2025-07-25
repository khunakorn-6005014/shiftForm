// src/controllers/shiftController.js
const Shift = require('../models/shift.js');
const asyncHandler = require('express-async-handler');
const { isAdmin } = require('../utils/auth.js');

// GET /api/shifts
exports.getAllShifts = asyncHandler(async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
    return res.status(401).json({ message: 'Not authorized' });
  }

    if (!isAdmin({ user: currentUser })) {
       return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    const shifts = await Shift.find().sort({ date: -1 });
    res.status(200).json(shifts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/shifts/:id
exports.getShiftById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const shift = await Shift.findById(id);
    
    const currentUser = req.user;
    if (!shift) return res.status(404).json({ 
        message: 'Not found' 
    });
    if (currentUser._id.toString() !== shift.userId.toString() && currentUser.isAdmin !== true) {
          return res.status(403).json({ message: 'Access denied. Not authorized.' });
        }
    res.status(200).json(shift);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/shifts
exports.addShift = asyncHandler(async (req, res) => {
  try {

    const {date,startTime,endTime,hourlyWage,place,slug, comments = ''} = req.body;
    if (!date || !startTime || !endTime || !hourlyWage || !place || !slug) {
      res.status(400);
    throw new Error('Please provide date, startTime, endTime, hourlyWage, place and slug.');
  }
  const validPlaces = ['Office','Warehouse','Remote'];
    if (!validPlaces.includes(place)) {
  res.status(400);
    throw new Error('Invalid place; must be Office, Warehouse or Remote');
}

    const Newshift = await Shift.create({
      userId: req.user._id.toString(),   
      date,
      startTime,
      endTime,
      hourlyWage,
      place,
      slug: slug.trim(),
      comments: comments.trim()

    })
    res.status(201).json({
      success: true,
      shift: Newshift
    } );
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/shifts/:id
exports.updateShiftById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const updateData = req.body;
    const shift       = await Shift.findById(id);
    if (!shift) return res.status(404).json({ message: 'Not found' });
    
    if (currentUser._id.toString() !== shift.userId.toString() && currentUser.isAdmin !== true) {
      return res.status(403).json({ message: 'Access denied. Not authorized.' });
    }
    console.log(updateData)
    const updated = await Shift.findByIdAndUpdate(id,updateData ,{ 
        new: true, 
        runValidators: true });
    res.json({
        success: true,
        shift: updated});
    } catch (err) {
      res.status(400).json({ 
        message: err.message 
    });
  }
});

// DELETE /api/shifts/:id  (admin only)
exports.deleteShift = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    if (!isAdmin({ user: currentUser })) {
       return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const shift = await Shift.findByIdAndDelete(id);
    if (!shift) return res.status(404).json({ message: 'Not found' });
      res.json({
        success: true,
        message: 'Shift deleted'});
    } catch (err) {
       res.status(500).json({ 
       message: err.message });
       }
});