import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  CubeIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const VendorProductForm = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { user, showToast } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    long_description: '',
    price: '',
    compare_at_price: '',
    category_id: '',
    stock_quantity: '',
    dimensions: {
      width: '',
      height: '',
      depth: '',
      weight: ''
    },
    materials: [],
    colors: [],
    tags: [],
    is_active: true,
    has_3d_model: false,
    has_ar_model: false
  });
  const [images, setImages] = useState([]);
  const [newMaterial, setNewMaterial] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');
  useEffect(() => {
    fetchCategories();
    
    if (productId) {
      fetchProduct();
    }
  }, [productId, user]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/furniture/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const product = await response.json();
        
        // Check if user owns this product
        if (product.vendor_id !== user.id) {
          showToast('You can only edit your own products', 'error');
          navigate('/vendor-dashboard');
          return;
        }
        
        setFormData({
          title: product.title || '',
          short_description: product.short_description || '',
          long_description: product.long_description || '',
          price: product.price?.toString() || '',
          compare_at_price: product.compare_at_price?.toString() || '',
          category_id: product.category_id || '',
          stock_quantity: product.stock_quantity?.toString() || '',
          dimensions: {
            width: product.dimensions?.width?.toString() || '',
            height: product.dimensions?.height?.toString() || '',
            depth: product.dimensions?.depth?.toString() || '',
            weight: product.dimensions?.weight?.toString() || ''
          },
          materials: product.materials || [],
          colors: product.colors || [],
          tags: product.tags || [],
          is_active: product.is_active !== false,
          has_3d_model: product.has_3d_model || false,
          has_ar_model: product.has_ar_model || false
        });
        
        // Set existing images
        if (product.media_assets) {
          setImages(product.media_assets.filter(asset => asset.type === 'image'));
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      showToast('Failed to load product', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('dimensions.')) {
      const dimensionField = name.split('.')[1];
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
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const addArrayItem = (arrayName, value, setValue) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: [...prev[arrayName], value.trim()]
      }));
      setValue('');
    }
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, {
            file,
            url: e.target.result,
            type: 'image',
            is_primary: images.length === 0
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      // If we removed the primary image, make the first remaining image primary
      if (newImages.length > 0 && !newImages.some(img => img.is_primary)) {
        newImages[0].is_primary = true;
      }
      return newImages;
    });
  };

  const setPrimaryImage = (index) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      is_primary: i === index
    })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add product data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        dimensions: {
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : null,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : null,
          depth: formData.dimensions.depth ? parseFloat(formData.dimensions.depth) : null,
          weight: formData.dimensions.weight ? parseFloat(formData.dimensions.weight) : null
        }
      };
      
      formDataToSend.append('productData', JSON.stringify(productData));
      
      // Add image files
      images.forEach((image, index) => {
        if (image.file) {
          formDataToSend.append('images', image.file);
          formDataToSend.append(`imageData_${index}`, JSON.stringify({
            is_primary: image.is_primary,
            type: 'image'
          }));
        }
      });

      const url = productId 
        ? `${import.meta.env.VITE_API_URL}/api/furniture/${productId}`
        : `${import.meta.env.VITE_API_URL}/api/furniture`;
      
      const method = productId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        showToast(
          productId ? 'Product updated successfully!' : 'Product created successfully!',
          'success'
        );
        navigate('/vendor-dashboard');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showToast(error.message || 'Failed to save product', 'error');
    } finally {
      setIsLoading(false);    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {productId ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-[#b6cacb] text-lg">
            {productId ? 'Update your furniture listing' : 'Create a new furniture listing'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                      placeholder="Enter product title"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Short Description *
                    </label>
                    <input
                      type="text"
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                      placeholder="Brief description for listings"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Long Description
                    </label>
                    <textarea
                      name="long_description"
                      value={formData.long_description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                      placeholder="Detailed product description"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Category *
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id} className="bg-[#0c1825]">
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Pricing */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Pricing & Inventory</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Price * ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Compare At Price ($)
                    </label>
                    <input
                      type="number"
                      name="compare_at_price"
                      value={formData.compare_at_price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white text-sm font-medium mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Images and Details */}
            <div className="space-y-6">
              {/* Images */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Product Images</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Upload Images
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#29d4c5] file:text-white hover:file:bg-[#209aaa]"
                    />
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          
                          {image.is_primary && (
                            <div className="absolute top-2 left-2 bg-[#29d4c5] text-white px-2 py-1 rounded text-xs font-semibold">
                              Primary
                            </div>
                          )}
                          
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            {!image.is_primary && (
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(index)}
                                className="p-1 bg-[#29d4c5] text-white rounded text-xs"
                              >
                                Set Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-1 bg-red-500 text-white rounded"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Features & Options</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="has_3d_model"
                        checked={formData.has_3d_model}
                        onChange={handleInputChange}
                        className="rounded border-white/30 bg-white/10 text-[#29d4c5] focus:ring-[#29d4c5]"
                      />
                      <CubeIcon className="h-5 w-5 text-[#29d4c5]" />
                      <span className="text-white">Has 3D Model</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="has_ar_model"
                        checked={formData.has_ar_model}
                        onChange={handleInputChange}
                        className="rounded border-white/30 bg-white/10 text-[#29d4c5] focus:ring-[#29d4c5]"
                      />
                      <DevicePhoneMobileIcon className="h-5 w-5 text-[#29d4c5]" />
                      <span className="text-white">Has AR Model</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="rounded border-white/30 bg-white/10 text-[#29d4c5] focus:ring-[#29d4c5]"
                      />
                      <CheckCircleIcon className="h-5 w-5 text-[#29d4c5]" />
                      <span className="text-white">Active (Visible to customers)</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Dimensions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg mt-8"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Dimensions</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Width (inches)
                </label>
                <input
                  type="number"
                  name="dimensions.width"
                  value={formData.dimensions.width}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Height (inches)
                </label>
                <input
                  type="number"
                  name="dimensions.height"
                  value={formData.dimensions.height}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Depth (inches)
                </label>
                <input
                  type="number"
                  name="dimensions.depth"
                  value={formData.dimensions.depth}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  name="dimensions.weight"
                  value={formData.dimensions.weight}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
          </motion.div>

          {/* Materials, Colors, Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg mt-8"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Materials, Colors & Tags</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Materials */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Materials
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    className="flex-1 p-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                    placeholder="Add material"
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('materials', newMaterial, setNewMaterial)}
                    className="p-2 bg-[#29d4c5] text-white rounded-lg hover:bg-[#209aaa]"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.materials.map((material, index) => (
                    <span
                      key={index}
                      className="bg-[#29d4c5]/20 text-[#29d4c5] px-2 py-1 rounded text-sm flex items-center gap-1"
                    >
                      {material}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('materials', index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Colors
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="flex-1 p-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                    placeholder="Add color"
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('colors', newColor, setNewColor)}
                    className="p-2 bg-[#29d4c5] text-white rounded-lg hover:bg-[#209aaa]"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color, index) => (
                    <span
                      key={index}
                      className="bg-[#29d4c5]/20 text-[#29d4c5] px-2 py-1 rounded text-sm flex items-center gap-1"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('colors', index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 p-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                    placeholder="Add tag"
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('tags', newTag, setNewTag)}
                    className="p-2 bg-[#29d4c5] text-white rounded-lg hover:bg-[#209aaa]"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-[#29d4c5]/20 text-[#29d4c5] px-2 py-1 rounded text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeArrayItem('tags', index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Submit Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end gap-4 mt-8"
          >
            <button
              type="button"
              onClick={() => navigate('/vendor-dashboard')}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  {productId ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default VendorProductForm;
