const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');
const { protect, authorize } = require('../middleware/auth');

// @desc    Submit inquiry
// @route   POST /api/inquiries
router.post('/', asyncHandler(async (req, res) => {
  const { item, quantity, unit, message, email } = req.body;
  const inquiry = await Inquiry.create({ item, quantity, unit, message, email });
  sendResponse(res, 201, { data: inquiry });
}));

// @desc    Get all inquiries (Admin only)
// @route   GET /api/inquiries
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find().sort('-createdAt');
  sendResponse(res, 200, { data: inquiries });
}));

module.exports = router;
