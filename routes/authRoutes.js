const express = require('express');
const router = express.Router();
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');
const ErrorResponse = require('../utils/ErrorResponse');

// Get token from model and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  sendResponse(res, statusCode, { token });
};

// @desc    Register user
// @route   POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });
  sendTokenResponse(user, 201, res);
}));

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ErrorResponse('Please provide an email and password', 400);
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ErrorResponse('Invalid credentials', 401);
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ErrorResponse('Invalid credentials', 401);
  }
  sendTokenResponse(user, 200, res);
}));

module.exports = router;
