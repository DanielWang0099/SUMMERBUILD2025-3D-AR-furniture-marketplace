require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3002; // Changed to 3002 to avoid conflict with frontend

// Middleware
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

// Mock data for development
const furnitureItems = [
  {
    id: 1,
    name: "Modern Sectional Sofa",
    price: 1299,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    category: "sofas",
    has3D: true,
    hasAR: true,
    rating: 4.8,
    reviews: 156,
    description: "Experience ultimate comfort with this modern sectional sofa.",
    seller: "Furniture Plus",
    inStock: true
  },
  {
    id: 2,
    name: "Oak Dining Table",
    price: 899,
    image: "https://images.unsplash.com/photo-1549497538-303791108f95?w=400",
    category: "tables",
    has3D: true,
    hasAR: true,
    rating: 4.9,
    reviews: 89,
    description: "Handcrafted oak dining table perfect for family gatherings.",
    seller: "Woodworks Co",
    inStock: true
  },
  {
    id: 3,
    name: "Platform Bed Frame",
    price: 599,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400",
    category: "beds",
    has3D: false,
    hasAR: false,
    rating: 4.7,
    reviews: 203,
    description: "Minimalist platform bed frame with clean lines.",
    seller: "Sleep Comfort",
    inStock: true
  },
  {
    id: 4,
    name: "Industrial Bookshelf",
    price: 449,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400",
    category: "storage",
    has3D: true,
    hasAR: true,
    rating: 4.6,
    reviews: 78,
    description: "Industrial-style bookshelf with metal frame and wood shelves.",
    seller: "Urban Living",
    inStock: true
  },
  {
    id: 5,
    name: "Pendant Light Fixture",
    price: 299,
    image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400",
    category: "lighting",
    has3D: true,
    hasAR: false,
    rating: 4.8,
    reviews: 45,
    description: "Modern pendant light with adjustable height.",
    seller: "Bright Ideas",
    inStock: true
  },
  {
    id: 6,
    name: "Velvet Accent Chair",
    price: 799,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400",
    category: "sofas",
    has3D: true,
    hasAR: true,
    rating: 4.9,
    reviews: 134,
    description: "Luxurious velvet accent chair in emerald green.",
    seller: "Luxury Furniture",
    inStock: true
  }
];

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'PlaceIt Backend API is running!',
    version: '1.0.0',
    endpoints: [
      'GET /api/products - Get all products',
      'GET /api/products/:id - Get product by ID',
      'GET /api/categories - Get all categories'
    ]
  });
});

// API Routes
// Get all products with optional filtering
app.get('/api/products', (req, res) => {
  const { category, minPrice, maxPrice, search, has3D, hasAR } = req.query;
  
  let filteredItems = [...furnitureItems];
  
  if (category && category !== 'all') {
    filteredItems = filteredItems.filter(item => item.category === category);
  }
  
  if (minPrice) {
    filteredItems = filteredItems.filter(item => item.price >= parseInt(minPrice));
  }
  
  if (maxPrice) {
    filteredItems = filteredItems.filter(item => item.price <= parseInt(maxPrice));
  }
  
  if (search) {
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (has3D === 'true') {
    filteredItems = filteredItems.filter(item => item.has3D);
  }
  
  if (hasAR === 'true') {
    filteredItems = filteredItems.filter(item => item.hasAR);
  }
  
  res.json({
    success: true,
    data: filteredItems,
    count: filteredItems.length,
    total: furnitureItems.length
  });
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = furnitureItems.find(item => item.id === productId);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  res.json({
    success: true,
    data: product
  });
});

// Get all categories
app.get('/api/categories', (req, res) => {
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'sofas', name: 'Sofas & Chairs' },
    { id: 'tables', name: 'Tables' },
    { id: 'beds', name: 'Beds & Mattresses' },
    { id: 'storage', name: 'Storage' },
    { id: 'lighting', name: 'Lighting' },
    { id: 'decor', name: 'Decor' },
  ];
  
  res.json({
    success: true,
    data: categories
  });
});

// You would add your Supabase integration here
// const { createClient } = require('@supabase/supabase-js');
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

app.listen(port, () => {
  console.log(`PlaceIt Backend API listening on port ${port}`);
  console.log(`API documentation available at http://localhost:${port}`);
});