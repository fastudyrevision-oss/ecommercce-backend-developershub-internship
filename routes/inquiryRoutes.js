const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');

// @desc    Submit inquiry
// @route   POST /api/inquiries
router.post('/', async (req, res) => {
  try {
    const inquiry = await Inquiry.create(req.body);
    res.status(201).json({ success: true, data: inquiry });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// @desc    Get all inquiries (Admin only in production)
// @route   GET /api/inquiries
router.get('/', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort('-createdAt');
    res.status(200).json({ success: true, data: inquiries });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
