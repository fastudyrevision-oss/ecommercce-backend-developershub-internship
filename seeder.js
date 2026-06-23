const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load models
const Product = require('./models/Product');

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (err) {
    console.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  }
};

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
    await connectDB();
    await Product.create(products);
    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(`Import failed: ${err.message}`);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(`Delete failed: ${err.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.error('Please use -i to import or -d to delete data');
  process.exit(1);
}
