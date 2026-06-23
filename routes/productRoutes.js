const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/sendResponse');
const ErrorResponse = require('../utils/ErrorResponse');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all products
// @route   GET /api/products
router.get('/', advancedResults(Product, { allowedFilters: ['category', 'price', 'name', 'stock'], maxLimit: 100 }), (req, res) => {
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
router.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { name, price, category, image, description, stock } = req.body;
  const product = await Product.create({ name, price, category, image, description, stock });
  sendResponse(res, 201, { data: product });
}));

module.exports = router;
