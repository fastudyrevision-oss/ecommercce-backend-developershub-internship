const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
  },
  image: {
    type: String,
    default: 'no-photo.jpg',
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  stock: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
