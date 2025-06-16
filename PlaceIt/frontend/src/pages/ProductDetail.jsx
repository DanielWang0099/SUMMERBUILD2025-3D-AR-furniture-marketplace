import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';
import ThreeDViewer from '../components/3D/ThreeDViewer';
import ARViewer from '../components/AR/ARViewer';
import { 
  CubeIcon,
  EyeIcon,
  ShoppingCartIcon,
  HeartIcon as HeartOutlineIcon,
  StarIcon,
  ShareIcon,
  CameraIcon,
  PlayIcon,
  ArrowLeftIcon,
  CheckIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, addToFavorites, removeFromFavorites, favorites, showToast } = useApp();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isARActive, setIsARActive] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getFurnitureById(id);
        
        if (response.success) {
          setProduct(response.data);
          setError(null);
        } else {
          throw new Error(response.message || 'Failed to load product');
        }
      } catch (err) {
        setError(err.message || 'Failed to load product');
        showToast({ type: 'error', message: err.message || 'Failed to load product' });
        console.error('Error fetching product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await apiService.getReviews(id);
        if (response.success) {
          setReviews(response.data || []);
        } else {
          console.warn('No reviews found or error fetching reviews');
          setReviews([]);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      }
    };

    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);
  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await addToCart(product, quantity);
      showToast({ type: 'success', message: `${product.title} added to cart!` });
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to add to cart' });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    
    try {
      const isFavorite = favorites.some(fav => fav.furniture_id === product.id);
      if (isFavorite) {
        await removeFromFavorites(product.id);
        showToast({ type: 'info', message: 'Removed from favorites' });
      } else {
        await addToFavorites(product);
        showToast({ type: 'success', message: 'Added to favorites!' });
      }
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to update favorites' });
    }
  };

  const isFavorite = favorites.some(fav => fav.furniture.id === product?.id);
  const images = product?.media_assets?.filter(asset => asset.type === 'image') || [];
  const primaryImage = images.find(img => img.is_primary) || images[0];
  const averageRating = product?.average_rating || 0;
  const reviewCount = product?.review_count || 0;

  const tabs = [
    { id: 'description', name: 'Description' },
    { id: 'specifications', name: 'Specifications' },
    { id: 'reviews', name: `Reviews (${reviewCount})` }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#29d4c5] mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error || 'Product not found'}</p>
          <Link 
            to="/browse" 
            className="px-6 py-3 bg-[#29d4c5] text-white rounded-lg hover:bg-[#209aaa] transition-colors"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa]">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/browse"
          className="inline-flex items-center gap-2 text-white hover:text-[#29d4c5] mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images and Media */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="aspect-square bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-lg relative"
            >
              {show3D ? (
                <ThreeDViewer 
                  modelUrl={product.model_3d_url} 
                  onClose={() => setShow3D(false)}
                />
              ) : isARActive ? (
                <ARViewer 
                  modelUrl={product.model_3d_url}
                  onClose={() => setIsARActive(false)}
                />
              ) : (
                <img
                  src={images[selectedImage]?.url || primaryImage?.url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {product.has_3d_model && (
                  <button
                    onClick={() => setShow3D(!show3D)}
                    className="bg-[#29d4c5] text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 hover:bg-[#209aaa] transition-colors"
                  >
                    <CubeIcon className="h-4 w-4" />
                    {show3D ? 'Exit 3D' : 'View 3D'}
                  </button>
                )}
                {product.has_ar_support && (
                  <button
                    onClick={() => setIsARActive(!isARActive)}
                    className="bg-[#209aaa] text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 hover:bg-[#29d4c5] transition-colors"
                  >
                    <EyeIcon className="h-4 w-4" />
                    {isARActive ? 'Exit AR' : 'Try AR'}
                  </button>
                )}
              </div>

              {/* Favorite Button */}
              <button
                onClick={handleToggleFavorite}
                className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                {isFavorite ? (
                  <HeartSolidIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartOutlineIcon className="h-6 w-6 text-white" />
                )}
              </button>
            </motion.div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-[#29d4c5]'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                  <span className="text-white ml-2">
                    {averageRating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-[#29d4c5]">
                ${product.price}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-xl text-[#b6cacb] line-through">
                  ${product.compare_at_price}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-[#b6cacb] text-lg leading-relaxed">
              {product.short_description || product.description}
            </p>

            {/* Key Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">Key Features:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-[#b6cacb]">
                      <CheckIcon className="h-4 w-4 text-[#29d4c5]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-white font-medium">Quantity:</label>
                <div className="flex items-center border border-white/30 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-white hover:bg-white/10 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-white bg-white/10">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-white hover:bg-white/10 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full flex items-center justify-center gap-2 bg-[#29d4c5] hover:bg-[#209aaa] text-white py-4 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <ShoppingCartIcon className="h-5 w-5" />
                    Add to Cart - ${(product.price * quantity).toFixed(2)}
                  </>
                )}
              </button>

              {product.shipping && (
                <div className="flex items-center gap-2 mt-4 text-[#b6cacb]">
                  <TruckIcon className="h-4 w-4" />
                  <span className="text-sm">{product.shipping}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="border-b border-white/20">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#29d4c5] text-[#29d4c5]'
                      : 'border-transparent text-[#b6cacb] hover:text-white hover:border-white/30'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-8">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <p className="text-[#b6cacb] text-lg leading-relaxed">
                  {product.description}
                </p>
                {product.care_instructions && (
                  <div className="mt-6">
                    <h3 className="text-white font-semibold mb-3">Care Instructions:</h3>
                    <p className="text-[#b6cacb]">{product.care_instructions}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.dimensions && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">Dimensions</h3>
                    <div className="space-y-2">
                      {Object.entries(product.dimensions).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-[#b6cacb]">
                          <span className="capitalize">{key}:</span>
                          <span>{value} {product.dimensions.unit || ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-white font-semibold mb-3">Details</h3>
                  <div className="space-y-2">
                    {product.materials && (
                      <div className="flex justify-between text-[#b6cacb]">
                        <span>Materials:</span>
                        <span>{product.materials.join(', ')}</span>
                      </div>
                    )}
                    {product.colors && (
                      <div className="flex justify-between text-[#b6cacb]">
                        <span>Colors:</span>
                        <span>{product.colors.join(', ')}</span>
                      </div>
                    )}
                    {product.assembly_required !== undefined && (
                      <div className="flex justify-between text-[#b6cacb]">
                        <span>Assembly:</span>
                        <span>{product.assembly_required ? 'Required' : 'Not Required'}</span>
                      </div>
                    )}
                    {product.warranty_info && (
                      <div className="flex justify-between text-[#b6cacb]">
                        <span>Warranty:</span>
                        <span>{product.warranty_info}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#29d4c5] rounded-full flex items-center justify-center text-white font-semibold">
                            {review.user.name[0]}
                          </div>
                          <div>
                            <p className="text-white font-medium">{review.user.name}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-400'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[#b6cacb] text-sm">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.title && (
                        <h4 className="text-white font-semibold mb-2">{review.title}</h4>
                      )}
                      <p className="text-[#b6cacb]">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-[#b6cacb] text-lg">No reviews yet</p>
                    <p className="text-[#b6cacb]">Be the first to review this product!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
