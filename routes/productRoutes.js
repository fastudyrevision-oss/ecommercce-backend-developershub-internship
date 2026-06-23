const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all products
// @route   GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach((param) => delete reqQuery[param]);

    const allowedFilters = ['category', 'price', 'name', 'stock'];
    const sanitizedQuery = {};
    for (const key of Object.keys(reqQuery)) {
      if (allowedFilters.includes(key)) {
        sanitizedQuery[key] = reqQuery[key];
      }
    }

    let queryStr = JSON.stringify(sanitizedQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const products = await query;

    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      data: products,
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// @desc    Create new product
// @route   POST /api/products
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { name, price, category, image, description, stock } = req.body;
    const product = await Product.create({ name, price, category, image, description, stock });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
