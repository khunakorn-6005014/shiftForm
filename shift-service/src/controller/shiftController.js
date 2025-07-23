// src/controllers/shiftController.js
import Shift from'../models/shift';
import asyncHandler from 'express-async-handler';
//import { v4 as uuidv4 } from 'uuid';
// GET /api/shifts
export const getAllShifts = asyncHandler(async (req, res) => {
  try {
    const shifts = await Shift.find().sort({ date: -1 });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/shifts/:id
export const getShiftById = asyncHandler(async (req, res) => {
  try {
    const shift = await Shift.findOne(req.params.id);
    if (!shift) return res.status(404).json({ message: 'Not found' });
    res.json(shift);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/shifts
export const addShift = asyncHandler(async (req, res) => {
  try {
    const {date,startTime,endTime,hourlyWage,place,slug, comments = ''
} = req.body;
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
     user: req.user.id,   // or wherever you store user
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
export const updateShiftById = asyncHandler(async (req, res) => {
  try {
    const shift = await Shift.findOneAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!shift) return res.status(404).json({ message: 'Not found' });
    res.json({
      success: true,
      shift: shift
    });
  } catch (err) {
    res.status(400).json({ 
      message: err.message 
    });
  }
});

// DELETE /api/shifts/:id  (admin only)
export const deleteShift = asyncHandler(async (req, res) => {
  try {
    const shift = await Shift.findOneAndDelete(req.params.id);
    if (!shift) return res.status(404).json({ message: 'Not found' });
    res.json({
     success: true,
     message: 'Shift deleted'
         });
  } catch (err) {
    res.status(500).json({ 
     message: err.message });
  }
});