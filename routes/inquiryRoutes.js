const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const { protect, authorize } = require('../middleware/auth');

// @desc    Submit inquiry
// @route   POST /api/inquiries
router.post('/', async (req, res, next) => {
  try {
    const { item, quantity, unit, message, email } = req.body;
    const inquiry = await Inquiry.create({ item, quantity, unit, message, email });
    res.status(201).json({ success: true, data: inquiry });
  } catch (err) {
    next(err);
  }
});

// @desc    Get all inquiries (Admin only)
// @route   GET /api/inquiries
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort('-createdAt');
    res.status(200).json({ success: true, data: inquiries });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
