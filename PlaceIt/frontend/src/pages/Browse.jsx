import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';
import NoData from '../components/UI/NoData';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  CubeIcon,
  EyeIcon,
  ShoppingCartIcon,
  HeartIcon as HeartOutlineIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const Browse = () => {
  const { addToCart, addToFavorites, removeFromFavorites, favorites, categories, showToast } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);
  const [togglingFavorite, setTogglingFavorite] = useState(null);
  const [show3DOnly, setShow3DOnly] = useState(false);
  const [showAROnly, setShowAROnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [furniture, setFurniture] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Fetch furniture data
  useEffect(() => {
    const fetchFurniture = async () => {
      try {
        setIsLoading(true);
        const params = {
          search: searchTerm,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          has3D: show3DOnly || undefined,
          hasAR: showAROnly || undefined,
          sortBy
        };
        
        const response = await apiService.getFurniture(params);
        
        if (response.success) {
          setFurniture(response.data || []);
          setError(null);
        } else {
          throw new Error(response.message || 'Failed to load furniture');
        }
      } catch (err) {
        setError(err.message || 'Failed to load furniture');
        showToast({ type: 'error', message: err.message || 'Failed to load furniture' });
        console.error('Error fetching furniture:', err);
        setFurniture([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };    fetchFurniture();
  }, [searchTerm, selectedCategory, priceRange, show3DOnly, showAROnly, sortBy]);
  const handleAddToCart = async (furnitureItem) => {
    try {
      setAddingToCart(furnitureItem.id);
      await addToCart(furnitureItem, 1);
      showToast({ type: 'success', message: 'Added to cart!' });
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to add to cart' });
    } finally {
      setAddingToCart(null);
    }
  };

  const handleToggleFavorite = async (furnitureItem) => {
    // Prevent multiple rapid clicks
    if (togglingFavorite === furnitureItem.id) return;
    
    try {
      setTogglingFavorite(furnitureItem.id);
      
      // Check current favorite status more reliably
      const isFavorite = favorites.some(fav => 
        (fav.furniture?.id === furnitureItem.id) || (fav.furniture_id === furnitureItem.id)
      );
      
      if (isFavorite) {
        await removeFromFavorites(furnitureItem.id);
        showToast({ type: 'info', message: 'Removed from favorites' });
      } else {
        await addToFavorites(furnitureItem);
        showToast({ type: 'success', message: 'Added to favorites!' });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast({ type: 'error', message: 'Failed to update favorites' });
    } finally {
      setTogglingFavorite(null);
    }
  };

  const allCategories = [
    { id: 'all', name: 'All Categories', slug: 'all' },
    ...categories
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#29d4c5] mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading furniture...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa] flex items-center justify-center">
        <NoData 
          message={error}
          icon={EyeIcon}
          className="max-w-md"
          actionComponent={
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-[#29d4c5] text-white rounded-lg hover:bg-[#209aaa] transition-colors"
            >
              Try Again
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover Amazing Furniture
          </h1>
          <p className="text-[#b6cacb] text-lg max-w-2xl mx-auto">
            Browse our curated collection of furniture with 3D models and AR visualization
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 flex">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="h-5 w-5 text-[#b6cacb] absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search furniture... (Press Enter to search)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSearchTerm(searchInput);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-l-lg text-white placeholder-[#b6cacb] focus:outline-none focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setSearchTerm(searchInput)}
                className="px-4 py-3 bg-[#29d4c5] text-white rounded-r-lg hover:bg-[#209aaa] transition-colors border border-[#29d4c5] flex items-center"
              >
                Search
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#29d4c5]"
            >
              {allCategories.map(category => (
                <option key={category.id} value={category.slug || category.id} className="bg-[#0c1825] text-white">
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#29d4c5]"
            >
              <option value="featured" className="bg-[#0c1825] text-white">Featured</option>
              <option value="price_asc" className="bg-[#0c1825] text-white">Price: Low to High</option>
              <option value="price_desc" className="bg-[#0c1825] text-white">Price: High to Low</option>
              <option value="newest" className="bg-[#0c1825] text-white">Newest</option>
              <option value="rating" className="bg-[#0c1825] text-white">Highest Rated</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-[#29d4c5] text-white rounded-lg hover:bg-[#209aaa] transition-colors"
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-white/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* 3D Models */}
                <div>
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={show3DOnly}
                      onChange={(e) => setShow3DOnly(e.target.checked)}
                      className="rounded border-white/30 bg-white/10 text-[#29d4c5] focus:ring-[#29d4c5]"
                    />
                    <CubeIcon className="h-5 w-5" />
                    3D Models Only
                  </label>
                </div>

                {/* AR Support */}
                <div>
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAROnly}
                      onChange={(e) => setShowAROnly(e.target.checked)}
                      className="rounded border-white/30 bg-white/10 text-[#29d4c5] focus:ring-[#29d4c5]"
                    />
                    <EyeIcon className="h-5 w-5" />
                    AR Support Only
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-[#b6cacb]">
            Showing {furniture.length} result{furniture.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Furniture Grid */}
        {furniture.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🪑</div>
            <h3 className="text-xl font-semibold text-white mb-2">No furniture found</h3>
            <p className="text-[#b6cacb] mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceRange([0, 5000]);
                setShow3DOnly(false);
                setShowAROnly(false);
                setSortBy('featured');
              }}
              className="px-6 py-3 bg-[#29d4c5] text-white rounded-lg hover:bg-[#209aaa] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">            {furniture.map((item) => {
              // More robust favorite checking to match ProductDetail component
              const isFavorite = favorites.some(fav => 
                (fav.furniture?.id === item.id) || (fav.furniture_id === item.id)
              );
              const primaryImage = item.media_assets?.find(media => media.is_primary && media.type === 'image')?.url || 
                                   item.media_assets?.find(media => media.type === 'image')?.url ||
                                   'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400';
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="relative">
                    <img
                      src={primaryImage}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {item.has_3d_model && (
                        <span className="bg-[#29d4c5] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <CubeIcon className="h-3 w-3" />
                          3D
                        </span>
                      )}
                      {item.has_ar_support && (
                        <span className="bg-[#209aaa] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <EyeIcon className="h-3 w-3" />
                          AR
                        </span>
                      )}
                    </div>                    {/* Favorite Button */}
                    <button
                      onClick={() => handleToggleFavorite(item)}
                      disabled={togglingFavorite === item.id}
                      className="absolute top-2 right-2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {togglingFavorite === item.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : isFavorite ? (
                        <HeartSolidIcon className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartOutlineIcon className="h-5 w-5 text-white" />
                      )}
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold text-lg leading-tight">
                        {item.title}
                      </h3>
                    </div>
                    
                    <p className="text-[#b6cacb] text-sm mb-3 line-clamp-2">
                      {item.short_description || item.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(item.average_rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[#b6cacb] text-sm">
                        ({item.review_count || 0})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[#29d4c5] text-xl font-bold">
                          ${item.price}
                        </span>
                        {item.compare_at_price && item.compare_at_price > item.price && (
                          <span className="text-[#b6cacb] text-sm line-through ml-2">
                            ${item.compare_at_price}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Link
                          to={`/product/${item.id}`}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <EyeIcon className="h-5 w-5 text-white" />
                        </Link>
                        
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={addingToCart === item.id}
                          className="p-2 bg-[#29d4c5] hover:bg-[#209aaa] rounded-lg transition-colors disabled:opacity-50"
                        >
                          {addingToCart === item.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <ShoppingCartIcon className="h-5 w-5 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
