import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  SparklesIcon,
  CubeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const Favorites = () => {
  const { favorites, removeFavorite, addToCart, showToast } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async (furniture) => {
    try {
      setIsLoading(true);
      await addToCart(furniture.id, 1);
      showToast('Added to cart!', 'success');
    } catch (error) {
      showToast('Failed to add to cart', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (furnitureId) => {
    try {
      await removeFavorite(furnitureId);
      showToast('Removed from favorites', 'info');
    } catch (error) {
      showToast('Failed to remove from favorites', 'error');
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa]">
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 shadow-lg max-w-md mx-auto"
          >
            <HeartIcon className="h-24 w-24 text-[#b6cacb] mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">No favorites yet</h2>
            <p className="text-[#b6cacb] mb-8">
              Start browsing and save furniture you love to see them here
            </p>
            <Link
              to="/browse"
              className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-2"
            >
              <SparklesIcon className="h-5 w-5" />
              <span>Discover Furniture</span>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Favorites
          </h1>
          <p className="text-[#b6cacb] text-lg">
            {favorites.length} item{favorites.length !== 1 ? 's' : ''} you love
          </p>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((favorite, index) => {
            const furniture = favorite.furniture;
            const primaryImage = furniture.media_assets?.find(media => media.is_primary && media.type === 'image')?.url || 
                                 furniture.media_assets?.find(media => media.type === 'image')?.url ||
                                 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400';
            
            return (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-lg group hover:shadow-xl transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={primaryImage}
                    alt={furniture.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Features Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {furniture.has_3d_model && (
                      <span className="bg-[#29d4c5]/90 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <CubeIcon className="h-3 w-3" />
                        3D
                      </span>
                    )}
                    {furniture.has_ar_model && (
                      <span className="bg-[#209aaa]/90 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <DevicePhoneMobileIcon className="h-3 w-3" />
                        AR
                      </span>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={() => handleRemoveFavorite(furniture.id)}
                    className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  >
                    <HeartSolidIcon className="h-5 w-5 text-red-400" />
                  </button>

                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Link
                      to={`/product/${furniture.id}`}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                      <EyeIcon className="h-5 w-5 text-white" />
                    </Link>
                    <button
                      onClick={() => handleAddToCart(furniture)}
                      disabled={isLoading}
                      className="p-3 bg-[#29d4c5]/80 backdrop-blur-sm rounded-full hover:bg-[#29d4c5] transition-colors disabled:opacity-50"
                    >
                      <ShoppingCartIcon className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                      {furniture.title}
                    </h3>
                    <p className="text-[#b6cacb] text-sm line-clamp-2">
                      {furniture.short_description}
                    </p>
                  </div>

                  {/* Price and Vendor */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#29d4c5] text-xl font-bold">
                        ${furniture.price}
                      </span>
                      {furniture.compare_at_price && furniture.compare_at_price > furniture.price && (
                        <span className="text-[#b6cacb] text-sm line-through ml-2">
                          ${furniture.compare_at_price}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[#b6cacb] text-xs">
                        by {furniture.vendor?.name || 'PlaceIt!'}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  {furniture.average_rating > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < Math.floor(furniture.average_rating)
                                ? 'text-yellow-400'
                                : 'text-gray-400'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-[#b6cacb] text-xs">
                        ({furniture.review_count || 0})
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 space-y-2">
                    <Link
                      to={`/product/${furniture.id}`}
                      className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors text-center block"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(furniture)}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <ShoppingCartIcon className="h-4 w-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <Link
            to="/browse"
            className="text-[#29d4c5] hover:text-white transition-colors font-medium"
          >
            ← Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
