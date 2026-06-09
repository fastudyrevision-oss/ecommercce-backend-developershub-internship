const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load models
const Product = require('./models/Product');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Sample Data
const products = [
  {
    name: 'Soft chairs',
    price: 19,
    category: 'Home and outdoor',
    description: 'Comfortable soft chairs for your home.',
    stock: 50,
  },
  {
    name: 'Sofa & chair',
    price: 19,
    category: 'Home and outdoor',
    description: 'Elegant sofa and chair set.',
    stock: 20,
  },
  {
    name: 'Smart watches',
    price: 19,
    category: 'Consumer electronics',
    description: 'Latest smart watches with multiple features.',
    stock: 100,
  },
  {
    name: 'Cameras',
    price: 89,
    category: 'Consumer electronics',
    description: 'High resolution digital cameras.',
    stock: 15,
  },
];

// Import into DB
const importData = async () => {
  try {
    await Product.create(products);
    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Product.deleteMany();
    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
