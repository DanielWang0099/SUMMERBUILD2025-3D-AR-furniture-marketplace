import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';
import ThreeDViewer from '../components/3D/ThreeDViewer';
import ThreeDViewerErrorBoundary from '../components/3D/ThreeDViewerErrorBoundary';
import ARStrategyRouter from '../components/AR/ARStrategyRouter';
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
  TruckIcon,
  PencilIcon,
  UserIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const ProductDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, addToFavorites, removeFromFavorites, favorites, showToast, user, isAuthenticated } = useApp();
  
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
  
  // Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    comment: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [reviewSortBy, setReviewSortBy] = useState('newest'); // newest, oldest, highest, lowest

  // Fetch product data
  useEffect(() => {    const fetchProduct = async () => {
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
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
        showToast({ type: 'error', message: err.message || 'Failed to load product' });
      } finally {
        setIsLoading(false);
      }
    };    const fetchReviews = async () => {
      try {
        const response = await apiService.getReviews(id);
        
        if (response.success) {
          setReviews(response.data || []);
          
          // Check if current user has already reviewed this product
          if (isAuthenticated && user && response.data) {
            const userReview = response.data.find(review => 
              review.user_id === user.id || 
              review.users?.id === user.id || 
              review.user?.id === user.id
            );
            setUserHasReviewed(!!userReview);
          }
        } else {
          console.warn('No reviews found or error fetching reviews:', response.message);
          setReviews([]);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
        // Don't show toast for reviews error, as it's not critical
      }
    };if (id) {
      fetchProduct();
      // Fetch reviews separately and don't let it block the main product loading
      fetchReviews().catch(err => {
        console.warn('Reviews fetch failed, but continuing with product display:', err);
      });
    }
  }, [id, isAuthenticated, user]); // Added isAuthenticated and user as dependencies

  // Increment view count only once when component mounts
  useEffect(() => {
    const incrementView = async () => {
      if (id) {
        try {
          await apiService.incrementViewCount(id);
        } catch (err) {
          console.warn('Failed to increment view count:', err);
        }
      }
    };

    incrementView();
  }, [id]); // This will run only when the id changes
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

  const isFavorite = favorites.some(fav => 
    (fav.furniture?.id === product?.id) || (fav.furniture_id === product?.id)
  );
const images = product?.media_assets?.filter(asset => asset.type === 'image') || [];
const modelAsset = product?.media_assets?.find(asset => asset.mime_type === 'model/gltf-binary');
const modelUrl = modelAsset?.url || product?.media_assets?.find(asset => asset.type === 'model_3d')?.url || null;
  const primaryImage = images.find(img => img.is_primary) || images[0];
  const averageRating = product?.average_rating || 0;
  const reviewCount = product?.review_count || 0;

  const tabs = [
    { id: 'description', name: 'Description' },
    { id: 'specifications', name: 'Specifications' },
    { id: 'reviews', name: `Reviews (${reviewCount})` }
  ];

  const handleGoBack = () => {
    const returnState = location.state;
    if (returnState?.returnTo) {
      if (returnState.returnTo === '/sell' && returnState.returnToTab) {
        // Navigate to sell page and set the correct tab
        navigate('/sell', { 
          state: { activeTab: returnState.returnToTab } 
        });
      } else {
        navigate(returnState.returnTo);
      }
    } else {
      // Default behavior - go to browse
      navigate('/browse');
    }
  };
  const getBackButtonText = () => {
    const returnState = location.state;
    if (returnState?.returnToName) {
      return `Back to ${returnState.returnToName}`;
    }
    return 'Back to Browse';
  };

  const isViewingOwnProduct = () => {
    const returnState = location.state;
    return returnState?.returnTo === '/sell' && returnState?.returnToTab === 'listings';
  };

  // Review handling functions
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showToast({ type: 'error', message: 'Please log in to leave a review' });
      return;
    }

    if (reviewForm.rating === 0) {
      showToast({ type: 'error', message: 'Please select a rating' });
      return;
    }

    if (!reviewForm.comment.trim()) {
      showToast({ type: 'error', message: 'Please write a review comment' });
      return;
    }

    setIsSubmittingReview(true);
    
    try {
      const reviewData = {
        furniture_id: product.id,
        rating: reviewForm.rating,
        title: reviewForm.title.trim() || null,
        comment: reviewForm.comment.trim()
      };

      const response = await apiService.createReview(reviewData);
      
      if (response.success) {
        showToast({ type: 'success', message: 'Review submitted successfully!' });
        
        // Reset form and close
        setReviewForm({ rating: 0, title: '', comment: '' });
        setShowReviewForm(false);
        setUserHasReviewed(true);
        
        // Refresh reviews
        const reviewsResponse = await apiService.getReviews(id);
        if (reviewsResponse.success) {
          setReviews(reviewsResponse.data || []);
        }
        
        // Refresh product to get updated average rating
        const productResponse = await apiService.getFurnitureById(id);
        if (productResponse.success) {
          setProduct(productResponse.data);
        }
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast({ 
        type: 'error', 
        message: error.message || 'Failed to submit review. Please try again.' 
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRatingClick = (rating) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleReviewFormChange = (field, value) => {
    setReviewForm(prev => ({ ...prev, [field]: value }));
  };

  const canWriteReview = () => {
    // User must be authenticated and not viewing their own product and not already reviewed
    return isAuthenticated && 
           user && 
           product?.vendor_id !== user.id && 
           !userHasReviewed &&
           !isViewingOwnProduct();
  };

  useEffect(() => {
    // Check if the user has already reviewed this product
    const checkUserReview = () => {
      if (reviews.length > 0 && user) {
        const userReview = reviews.find(review => review.user_id === user.id);
        setUserHasReviewed(!!userReview);
        if (userReview) {
          setReviewForm({
            rating: userReview.rating,
            title: userReview.title,
            comment: userReview.comment
          });
        }
      }
    };

    checkUserReview();
  }, [reviews, user]);

  const handleReviewFormOpen = () => {
    if (!isAuthenticated) {
      showToast({ type: 'error', message: 'You must be logged in to leave a review.' });
      return;
    }
    setShowReviewForm(true);
  };

  const handleReviewFormClose = () => {
    setShowReviewForm(false);
    setReviewForm({
      rating: 0,
      title: '',
      comment: ''
    });
    setHoverRating(0);
  };

  const sortedReviews = useMemo(() => {
    switch (reviewSortBy) {
      case 'highest':
        return [...reviews].sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return [...reviews].sort((a, b) => a.rating - b.rating);
      case 'oldest':
        return [...reviews].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      default:
        return [...reviews].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }, [reviews, reviewSortBy]);

  // Cleanup effect to close 3D/AR viewers when navigating away
  useEffect(() => {
    return () => {
      // Close any active viewers when component unmounts
      setShow3D(false);
      setIsARActive(false);
    };
  }, []);

  // Also close viewers when ID changes (navigating to different product)
  useEffect(() => {
    setShow3D(false);
    setIsARActive(false);
  }, [id]);

  // Listen for AR fallback to 3D viewer
  useEffect(() => {
    const handleOpenThreeDViewer = (event) => {
      const { modelUrl: eventModelUrl, productName } = event.detail;
      if (eventModelUrl && product) {
        setIsARActive(false);
        setShow3D(true);
      }
    };

    window.addEventListener('openThreeDViewer', handleOpenThreeDViewer);
    
    return () => {
      window.removeEventListener('openThreeDViewer', handleOpenThreeDViewer);
    };
  }, [product]);

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
          <p className="text-red-400 text-lg mb-4">{error || 'Product not found'}</p>          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-[#29d4c5] text-white rounded-lg hover:bg-[#209aaa] transition-colors"
          >
            {getBackButtonText()}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        {/* Back Button */}
        <button 
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 text-white hover:text-[#29d4c5] mb-6 transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          {getBackButtonText()}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images and Media */}
          <div className="space-y-4">
            {/* Main Image */}            
            <motion.div
              key={show3D ? '3d-viewer' : isARActive ? 'ar-viewer' : 'image-viewer'} // Add key to force remount
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="aspect-square bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-lg relative"
            > {show3D && modelUrl ? (                
                <ThreeDViewerErrorBoundary onClose={() => setShow3D(false)}>
                  <ThreeDViewer 
                    key="threeDViewer" // Ensure consistent key
                    modelUrl={modelUrl} 
                    onClose={() => setShow3D(false)}
                  />
                </ThreeDViewerErrorBoundary>) : isARActive && modelUrl ? (
                <ARStrategyRouter 
                  key="arViewer" // Ensure consistent key
                  isActive={isARActive}
                  productName={product.title}
                  modelUrl={modelUrl}
                  onClose={() => setIsARActive(false)}
                />
              ) : (
                <img
                  key="imageViewer" // Ensure consistent key
                  src={images[selectedImage]?.url || primaryImage?.url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">                {product.has_3d_model && modelUrl && (
                  <button
                    onClick={() => {
                      setShow3D(!show3D);
                      if (!show3D) setIsARActive(false); // Close AR when opening 3D
                    }}
                    className="bg-[#29d4c5] text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 hover:bg-[#209aaa] transition-colors"
                  >
                    <CubeIcon className="h-4 w-4" />
                    {show3D ? 'Exit 3D' : 'View 3D'}
                  </button>
                )}{product.has_ar_support && modelUrl && (
                  <button
                    onClick={() => {
                      setIsARActive(!isARActive);
                      if (!isARActive) setShow3D(false); // Close 3D when opening AR
                    }}
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
              </div>            )}

            {/* Quantity and Add to Cart - Hidden when viewing own product */}
            {!isViewingOwnProduct() && (
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
            )}

            {/* Viewing Own Product Message */}
            {isViewingOwnProduct() && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-[#29d4c5] mb-2">
                    <EyeIcon className="h-5 w-5" />
                    <span className="font-semibold">Viewing Your Product</span>
                  </div>
                  <p className="text-[#b6cacb] text-sm">
                    This is how your product appears to customers. You can edit this listing from your seller dashboard.
                  </p>
                </div>
              </div>
            )}
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
              <div className="space-y-8">
                {/* Stylish Note for Own Product */}
                {isAuthenticated && user && product?.vendor_id === user.id && (
                  <div className="bg-indigo-600/10 border border-indigo-600/20 rounded-2xl p-4 flex items-center gap-3 text-indigo-200 mb-4">
                    <CheckIcon className="h-5 w-5 text-indigo-400" />
                    <p className="text-sm">
                      You’re viewing your own product. You cannot add reviews to your own listings.
                    </p>
                  </div>
                )}

                {/* Review Summary */}
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white mb-1">
                        {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <StarSolidIcon
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(averageRating)
                                ? 'text-yellow-400'
                                : i < averageRating
                                ? 'text-yellow-400 opacity-50'
                                : 'text-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[#b6cacb] text-sm">
                        {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                    
                    <div className="hidden sm:block w-px h-16 bg-white/20"></div>
                    
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-3">Customer Reviews</h3>
                      <p className="text-[#b6cacb] text-sm">
                        {reviewCount > 0 
                          ? `See what ${reviewCount} ${reviewCount === 1 ? 'customer thinks' : 'customers think'} about this product`
                          : 'Be the first to share your experience with this product'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Write Review Button */}
                  {canWriteReview() && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowReviewForm(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 whitespace-nowrap"
                    >
                      <PencilIcon className="h-5 w-5" />
                      Write a Review
                    </motion.button>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <PencilIcon className="h-6 w-6 text-[#29d4c5]" />
                        Write Your Review
                      </h3>
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="text-[#b6cacb] hover:text-white transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleReviewSubmit} className="space-y-6">
                      {/* Rating Selection */}
                      <div>
                        <label className="block text-white font-medium mb-3">
                          Rating <span className="text-red-400">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => handleRatingClick(rating)}
                              onMouseEnter={() => setHoverRating(rating)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 rounded-lg hover:bg-white/10 transition-all duration-200"
                            >
                              <StarSolidIcon
                                className={`h-8 w-8 transition-all duration-200 ${
                                  rating <= (hoverRating || reviewForm.rating)
                                    ? 'text-yellow-400 scale-110'
                                    : 'text-gray-400 hover:text-yellow-200'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="ml-3 text-[#b6cacb] text-sm">
                            {reviewForm.rating > 0 && (
                              <>
                                {reviewForm.rating} of 5 stars
                                {reviewForm.rating === 5 && ' - Excellent!'}
                                {reviewForm.rating === 4 && ' - Very Good'}
                                {reviewForm.rating === 3 && ' - Good'}
                                {reviewForm.rating === 2 && ' - Fair'}
                                {reviewForm.rating === 1 && ' - Poor'}
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Review Title */}
                      <div>
                        <label className="block text-white font-medium mb-2">
                          Review Title (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Summarize your review..."
                          value={reviewForm.title}
                          onChange={(e) => handleReviewFormChange('title', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-[#b6cacb] focus:outline-none focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent transition-all duration-200"
                          maxLength={100}
                        />
                        <p className="text-[#b6cacb] text-sm mt-1">
                          {reviewForm.title.length}/100 characters
                        </p>
                      </div>

                      {/* Review Comment */}
                      <div>
                        <label className="block text-white font-medium mb-2">
                          Your Review <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          placeholder="Share your experience with this product..."
                          value={reviewForm.comment}
                          onChange={(e) => handleReviewFormChange('comment', e.target.value)}
                          rows={5}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-[#b6cacb] focus:outline-none focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent transition-all duration-200 resize-none"
                          maxLength={1000}
                        />
                        <p className="text-[#b6cacb] text-sm mt-1">
                          {reviewForm.comment.length}/1000 characters
                        </p>
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-4 pt-4">
                        <motion.button
                          type="submit"
                          disabled={isSubmittingReview || reviewForm.rating === 0}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                        >
                          {isSubmittingReview ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Submitting...
                            </div>
                          ) : (
                            'Submit Review'
                          )}
                        </motion.button>
                        
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    <>
                      <div className="flex items-center justify-end gap-4">
                        <label className="text-[#b6cacb] text-sm">Sort by:</label>
                        <select
                          value={reviewSortBy}
                          onChange={(e) => setReviewSortBy(e.target.value)}
                          className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#29d4c5]"
                        >
                          <option value="newest">Newest</option>
                          <option value="oldest">Oldest</option>
                          <option value="highest">Highest Rating</option>
                          <option value="lowest">Lowest Rating</option>
                        </select>
                      </div>

                      <h3 className="text-xl font-semibold text-white">Customer Reviews</h3>
                      {sortedReviews.map((review) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#29d4c5] to-[#209aaa] rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                                {review.users?.name?.[0] || review.user?.name?.[0] || 'U'}
                              </div>
                              <div>
                                <p className="text-white font-semibold">
                                  {review.users?.name || review.user?.name || 'Anonymous User'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <StarSolidIcon
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating
                                            ? 'text-yellow-400'
                                            : 'text-gray-400'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[#b6cacb] text-sm">
                                    {review.rating} of 5 stars
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[#b6cacb] text-sm">
                                {new Date(review.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                              {review.verified_purchase && (
                                <div className="flex items-center gap-1 mt-1 text-[#29d4c5] text-xs">
                                  <CheckIcon className="h-3 w-3" />
                                  Verified Purchase
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {review.title && (
                            <h4 className="text-white font-semibold mb-3 text-lg">
                              {review.title}
                            </h4>
                          )}
                          
                          <p className="text-[#b6cacb] leading-relaxed">
                            {review.comment}
                          </p>
                        </motion.div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                      <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <StarIcon className="h-10 w-10 text-[#b6cacb]" />
                        </div>
                        <h3 className="text-white font-semibold text-xl mb-2">No reviews yet</h3>
                        <p className="text-[#b6cacb] mb-6">
                          Be the first to share your experience with this product!
                        </p>
                        {canWriteReview() && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowReviewForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                          >
                            <PlusIcon className="h-5 w-5" />
                            Write First Review
                          </motion.button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Review Guidelines */}
                {(showReviewForm || reviews.length === 0) && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-blue-400" />
                      Review Guidelines
                    </h4>
                    <ul className="text-[#b6cacb] text-sm space-y-2">
                      <li>• Share your honest experience with the product</li>
                      <li>• Include details about quality, appearance, and functionality</li>
                      <li>• Be respectful and constructive in your feedback</li>
                      <li>• Avoid personal information in your review</li>
                    </ul>
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
