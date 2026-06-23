const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');
const ErrorResponse = require('../utils/ErrorResponse');
const advancedResults = require('../middleware/advancedResults');

// @desc    Get all products
// @route   GET /api/products
router.get('/', advancedResults(Product), (req, res) => {
  sendResponse(res, 200, res.advancedResults);
});

// @desc    Get single product
// @route   GET /api/products/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ErrorResponse('Product not found', 404);
  }
  sendResponse(res, 200, { data: product });
}));

// @desc    Create new product
// @route   POST /api/products
router.post('/', asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  sendResponse(res, 201, { data: product });
}));

module.exports = router;
