import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  CubeIcon,
  EyeIcon,
  ShoppingCartIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const Browse = () => {
  const { addToCart } = useApp();  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);  const [addingToCart, setAddingToCart] = useState(null);
  const [show3DOnly, setShow3DOnly] = useState(false);
  const [showAROnly, setShowAROnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'sofas', name: 'Sofas & Chairs' },
    { id: 'tables', name: 'Tables' },
    { id: 'beds', name: 'Beds & Mattresses' },
    { id: 'storage', name: 'Storage' },
    { id: 'lighting', name: 'Lighting' },
    { id: 'decor', name: 'Decor' },
  ];

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
      reviews: 156
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
      reviews: 89
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
      reviews: 203
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
      reviews: 78
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
      reviews: 45
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
      reviews: 134
    }
  ];  const filteredItems = furnitureItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    const matches3D = !show3DOnly || item.has3D;
    const matchesAR = !showAROnly || item.hasAR;
    return matchesSearch && matchesCategory && matchesPrice && matches3D && matchesAR;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return b.id - a.id; // Assuming higher ID means newer
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0; // featured - no sorting
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#b6cacb]/10 to-white">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-[#0c1825] via-[#2a5d93] to-[#209aaa] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Browse Furniture
            </h1>
            <p className="text-xl text-[#b6cacb] max-w-2xl mx-auto">
              Discover amazing furniture with 3D models and AR visualization
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#0c1825]">Filters</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 hover:bg-[#29d4c5]/20 rounded-lg"
                >
                  <FunnelIcon className="h-5 w-5 text-[#0c1825]" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-[#0c1825] mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search furniture..."
                      className="w-full pl-10 pr-4 py-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
                    />
                    <MagnifyingGlassIcon className="h-5 w-5 text-[#2a5d93] absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-[#0c1825] mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-[#0c1825] mb-2">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full accent-[#29d4c5]"
                    />
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-[#29d4c5]"
                    />
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-[#0c1825] mb-2">
                    Features
                  </label>                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="accent-[#29d4c5] mr-2" 
                        checked={show3DOnly}
                        onChange={(e) => setShow3DOnly(e.target.checked)}
                      />
                      <span className="text-sm text-[#2a5d93]">3D Model Available</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="accent-[#29d4c5] mr-2" 
                        checked={showAROnly}
                        onChange={(e) => setShowAROnly(e.target.checked)}
                      />
                      <span className="text-sm text-[#2a5d93]">AR Compatible</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">            <div className="flex justify-between items-center mb-6">
              <p className="text-[#2a5d93]">
                Showing {sortedItems.length} of {furnitureItems.length} items
              </p>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-2 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] bg-white/80"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                >
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex space-x-2">
                      {item.has3D && (
                        <div className="bg-[#29d4c5] text-white px-2 py-1 rounded text-xs font-semibold flex items-center space-x-1">
                          <CubeIcon className="h-3 w-3" />
                          <span>3D</span>
                        </div>
                      )}
                      {item.hasAR && (
                        <div className="bg-[#209aaa] text-white px-2 py-1 rounded text-xs font-semibold flex items-center space-x-1">
                          <EyeIcon className="h-3 w-3" />
                          <span>AR</span>
                        </div>
                      )}
                    </div>
                    <button className="absolute top-3 left-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <HeartIcon className="h-4 w-4 text-[#0c1825]" />
                    </button>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#0c1825] mb-2">{item.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-sm ${i < Math.floor(item.rating) ? 'text-[#29d4c5]' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-[#2a5d93] ml-2">({item.reviews})</span>
                    </div>
                    <p className="text-2xl font-bold text-[#0c1825] mb-4">${item.price.toLocaleString()}</p>
                      <div className="flex space-x-2">
                      <Link
                        to={`/product/${item.id}`}
                        className="flex-1 bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>View</span>
                      </Link>                      <button 
                        onClick={async () => {
                          setAddingToCart(item.id);
                          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
                          addToCart(item);
                          setAddingToCart(null);
                        }}
                        disabled={addingToCart === item.id}
                        className="bg-white/80 border border-[#29d4c5]/30 text-[#0c1825] py-2 px-4 rounded-lg hover:bg-[#29d4c5]/20 transition-colors flex items-center justify-center hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addingToCart === item.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0c1825]"></div>
                        ) : (
                          <ShoppingCartIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {sortedItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-[#2a5d93] mb-4">No items found matching your criteria</p>
                <button                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setPriceRange([0, 5000]);
                    setShow3DOnly(false);
                    setShowAROnly(false);
                  }}
                  className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
