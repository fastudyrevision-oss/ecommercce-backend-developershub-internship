const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');

// @desc    Submit inquiry
// @route   POST /api/inquiries
router.post('/', asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.create(req.body);
  sendResponse(res, 201, { data: inquiry });
}));

// @desc    Get all inquiries (Admin only in production)
// @route   GET /api/inquiries
router.get('/', asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find().sort('-createdAt');
  sendResponse(res, 200, { data: inquiries });
}));

module.exports = router;
