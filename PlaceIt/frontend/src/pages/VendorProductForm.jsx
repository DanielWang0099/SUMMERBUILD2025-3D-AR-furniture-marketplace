import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import UploadItemForm from './UploadItemForm';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import apiService from '../services/api';
import { 
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const VendorProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();
  const { user, showToast } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    long_description: '',
    description: '', // For compatibility with UploadItemForm
    price: '',
    compare_at_price: '',
    category_id: '',
    stock_quantity: '',
    inventory_count: '',
    dimensions: {
      width: '',
      height: '',
      depth: '',
      weight: '',
      unit: 'inches'
    },
    materials: [],
    colors: [],
    tags: [],
    features: [],
    is_active: true,
    has_3d_model: false,
    has_ar_model: false,
    status: 'active'  });
  const [images, setImages] = useState([]);
  const [uploadFiles, setUploadFiles] = useState({
    images: [],
    video: null
  });

  useEffect(() => {
    // Only initialize if user is loaded (not null)
    if (user === null) return; // Still loading user
    
    const initializePage = async () => {
      try {
        await fetchCategories();
        if (productId) {
          await fetchProduct();
        }
      } catch (error) {
        console.error('Error initializing page:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    initializePage();
  }, [productId, user]); // Add user as dependency
  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast({ type: 'error', message: 'Failed to load categories' });
      setCategories([]);
    }
  };
  const fetchProduct = async () => {
    try {
      if (!user || !user.id) {
        console.error('User not loaded or missing ID');
        return;
      }
      
      const apiResponse = await apiService.getFurnitureById(productId);
      const product = apiResponse.data || apiResponse;
      
      // Check if user owns this product
      const productVendorId = String(product.vendor_id);
      const userId = String(user.id);
      
      if (productVendorId !== userId) {
        showToast({ type: 'error', message: 'You can only edit your own products' });
        navigate('/vendor-dashboard');
        return;
      }
      
      setFormData({
        title: product.title || '',
        short_description: product.short_description || '',
        long_description: product.long_description || '',
        description: product.long_description || product.description || '',
        price: product.price?.toString() || '',
        compare_at_price: product.compare_at_price?.toString() || '',
        category_id: product.category_id || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        inventory_count: product.stock_quantity?.toString() || '',
        dimensions: {
          width: product.dimensions?.width?.toString() || '',
          height: product.dimensions?.height?.toString() || '',
          depth: product.dimensions?.depth?.toString() || '',
          weight: product.dimensions?.weight?.toString() || '',
          unit: product.dimensions?.unit || 'inches'
        },
        materials: product.materials || [],
        colors: product.colors || [],
        tags: product.tags || [],
        features: product.tags || product.features || [],
        is_active: product.is_active !== false,
        has_3d_model: product.has_3d_model || false,
        has_ar_model: product.has_ar_model || false,
        status: product.is_active ? 'active' : 'draft'
      });
      
      // Set existing images
      if (product.media_assets) {
        setImages(product.media_assets.filter(asset => asset.type === 'image'));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        showToast({ type: 'error', message: 'Session expired. Please log in again.' });
        navigate('/login');
        return;
      }
      showToast({ type: 'error', message: 'Failed to load product' });
    }
  };

  // Handle input changes for UploadItemForm compatibility
  const handleInputChange = (field, value) => {
    if (field.startsWith('dimensions.')) {
      const dimensionField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        // Sync description fields
        ...(field === 'description' && { long_description: value }),
        ...(field === 'long_description' && { description: value })
      }));
    }
  };

  // Handle array input changes (materials, colors, features)
  const handleArrayInputChange = (field, value) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: arrayValue
    }));
  };
  // Handle file uploads - simplified (no actual uploads in edit mode)
  const handleFileUpload = (type, files) => {
    // In edit mode, we don't handle new file uploads
    console.log(`File upload not supported in edit mode: ${type}`, files);
  };// Remove existing image - simplified (no API call)
  const handleRemoveExistingImage = (imageId) => {
    setImages(prev => prev.filter(img => (img.id || img.image_id) !== imageId));
  };

  // Set primary image - simplified (no API call)
  const handleSetPrimaryImage = (imageId) => {
    setImages(prev => prev.map(img => ({
      ...img,
      is_primary: (img.id || img.image_id) === imageId
    })));
  };
  // Submit listing (handles both create and update)
  const submitListing = async (e, status = 'active') => {
    e.preventDefault();
    setIsLoading(true);    try {
      // Prepare product data as JSON (no FormData)
      const productData = {
        title: formData.title,
        description: formData.long_description || formData.description,
        short_description: formData.short_description,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        category_id: formData.category_id || null,
        inventory_count: parseInt(formData.inventory_count || formData.stock_quantity || 0),
        dimensions: {
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : null,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : null,
          depth: formData.dimensions.depth ? parseFloat(formData.dimensions.depth) : null,
          weight: formData.dimensions.weight ? parseFloat(formData.dimensions.weight) : null,
          unit: formData.dimensions.unit || 'inches'
        },
        materials: formData.materials || [],
        colors: formData.colors || [],
        tags: formData.tags || [],
        features: formData.features || [],
        has_3d_model: formData.has_3d_model || false,
        has_ar_support: formData.has_ar_model || false,
        status: formData.is_active ? 'active' : status      };      console.log('Sending product data:', JSON.stringify(productData, null, 2));

      // Step 1: Create or update the product using API service
      let result;
      if (productId) {
        result = await apiService.updateFurniture(productId, productData);
      } else {
        result = await apiService.createFurniture(productData);      }
      
      const furnitureId = result.data.id;      showToast({
        type: 'success',
        message: productId ? 'Product updated successfully!' : 'Product created successfully!'
      });
      
      // Navigate back to sell page with listings tab
      navigate('/sell', {
        state: {
          activeTab: 'listings'
        }
      });

    } catch (error) {
      console.error('Error saving product:', error);
      showToast({ type: 'error', message: error.message || 'Failed to save product' });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while initializing or user is still loading
  if (isInitialLoading || user === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-white mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated (user is false when not authenticated, null when loading)
  if (user === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa] flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">Please log in to access this page</p>
          <button 
            onClick={() => navigate('/login')} 
            className="px-6 py-3 bg-[#29d4c5] text-white rounded-lg hover:bg-[#209aaa] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#b6cacb]/10 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#0c1825] via-[#2a5d93] to-[#209aaa] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {productId ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="text-xl text-[#b6cacb]">
                {productId ? 'Update your furniture listing' : 'Create a new furniture listing'}
              </p>
            </div>
            <button
              onClick={() => navigate('/sell', { state: { activeTab: 'listings' } })}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        <UploadItemForm
          formData={formData}
          setFormData={setFormData}
          uploadFiles={uploadFiles}
          handleInputChange={handleInputChange}
          handleArrayInputChange={handleArrayInputChange}
          handleFileUpload={handleFileUpload}
          submitListing={submitListing}
          loading={isLoading}
          categories={categories}
          isEditMode={!!productId}
          existingImages={images}
          onRemoveExistingImage={handleRemoveExistingImage}
          onSetPrimaryImage={handleSetPrimaryImage}
          disableMediaEditing={!!productId}
          isDashboardMode={true}
        />
      </div>
    </div>
  );
};

export default VendorProductForm;
