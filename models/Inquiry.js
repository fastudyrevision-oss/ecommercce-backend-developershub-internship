const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
  item: {
    type: String,
    required: [true, 'Please add the item name'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please add the quantity'],
  },
  unit: {
    type: String,
    required: [true, 'Please add the unit (e.g. Pcs)'],
  },
  message: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Inquiry', InquirySchema);
